const express = require('express');
const app = express();

const parser = require("body-parser");
const axios = require("axios");
const wiki = require("wikijs").default;
const lodash = require("lodash");

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.listen(80, function () {
    console.log("Relay server started. Listening for events.");
});

app.post("/", function (request, response) {
    try {
        axios.get("https://api.tarkovinsight.com/", { params: { queryObject: request.body.data } }).then(function (apiResponse) {
            response.set("Access-Control-Allow-Origin", "*");
            var htmlResponse = "";
            var wikiLinkName = getWikiLinkName(apiResponse.data.wikiLink);

            wiki({
                apiUrl: "https://escapefromtarkov.gamepedia.com/api.php",
                origin: null
            })
            .page(wikiLinkName)
                .then(page => page.content())
                .then(function (infoArray) {
                    htmlResponse += "<img src='" + apiResponse.data.icon + "' /><br />";
                    htmlResponse += "Price: <b>" + apiResponse.data.traderPriceCur + currency(apiResponse.data.price) + "</b><br /><br />";

                    htmlResponse += "Trader: <b>" + apiResponse.data.traderName + "</b><br />";
                    htmlResponse += "Trader Price: <b>" + apiResponse.data.traderPriceCur + currency(apiResponse.data.traderPrice) + "</b>";

                    if (infoArray) {
                        var infoLength = infoArray.length;
                        for (var infoIndex = 0; infoIndex < infoLength; infoIndex++) {
                            if (infoArray[infoIndex].title && infoArray[infoIndex].title.toLowerCase().indexOf("hideout") > -1) {
                                htmlResponse += "<br/><br/>";
                                htmlResponse += "<b>" + infoArray[infoIndex].title + "</b>:<br/>";
                                htmlResponse += infoArray[infoIndex].content.replace(/\n/g, "<br />");
                            }

                            if (infoArray[infoIndex].title && infoArray[infoIndex].title.toLowerCase().indexOf("quest") > -1) {
                                htmlResponse += "<br/><br/>";
                                htmlResponse += "<b>" + infoArray[infoIndex].title + "</b>:<br/>";
                                htmlResponse += infoArray[infoIndex].content.replace(/\n/g, "<br />");
                            }
                        }
                    }

                    response.send(htmlResponse);
                }).catch();
        });
    } catch (ex) {
        response.send("Unable to query the API server.");
    }
});

function getWikiLinkName(url) {
    if (url) {
        var urlArray = url.split("/");
        var urlArrayLength = urlArray.length;

        return (urlArray[urlArrayLength - 1]);
    }
}

function currency(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
