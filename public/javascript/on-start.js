const $ = require("jquery");

/*

*/

function on_start() {
    let window_width = $(window).width;
    let window_height = $(window).height;
    
    $("#front-page").fadeIn(600);
}

module.exports.on_start = on_start;