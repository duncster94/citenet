const $ = require("jquery");

/*

*/

function onStart() {
    let window_width = $(window).width;
    let window_height = $(window).height;

    console.log("ready to fade");
    // $("#front-page").fadeIn(600);
    // $("#front-page").addClass("in");

    $("#front-page").show();
}

module.exports.onStart = onStart;
