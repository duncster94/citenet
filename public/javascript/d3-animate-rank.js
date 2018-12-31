const $ = require("jquery")

function addAnimateRankListener() {
    /*
    Adds a click listener to the 'animate rank' button.
    */

    $("#animate-rank-button").on("click", function() {
        animateRank();
    });
}

function animateRank() {
    console.log('clicked');
    $(".links").hide();
}

module.exports.addAnimateRankListener = addAnimateRankListener