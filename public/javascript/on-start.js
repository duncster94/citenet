const $ = require("jquery");
/*

*/

function onStart() {
    let windowHeight = $(window).height;
    let windowWidth = $(window).width;

    // Flag for whether or not FAB can be activated by hover
    let hoverEnabled = true;

    $("#front-page").show();

    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
      // Require click to activate FAB on mobile device
      let hoverEnabled = false;
      // Enable FAB Tooltips only if use is NOT on a mobile device
      let tooltips = document.querySelectorAll('.tooltipped');
      let tooltipInstances = M.Tooltip.init(tooltips);
    }

    // Enable FAB
    let fab = document.querySelectorAll('.fixed-action-btnm');
    let fabInstances = M.FloatingActionButton.init(fab, {
      // User must click to open the tray
      // In the future, it would be better to disable this on mobile but enable it on desktop
      hoverEnabled: hoverEnabled,
    });
}

module.exports.onStart = onStart;
