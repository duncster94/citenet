const $ = require("jquery");
/*

*/

function onStart() {
    let windowHeight = $(window).height;
    let windowWidth = $(window).width;

    $("#front-page").show();

    // Enable FAB
    let fab = document.querySelectorAll('.fixed-action-btnm');
    let fabInstances = M.FloatingActionButton.init(fab, {
      // User must click to open the tray
      // In the future, it would be better to disable this on mobile but enable it on desktop
      hoverEnabled: false,
    });

    // Enable FAB Tooltips only if use is NOT on a mobile device
    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
      let tooltips = document.querySelectorAll('.tooltipped');
      let tooltipInstances = M.Tooltip.init(tooltips, {
        // Makes the tooltip animations much snappier than the default
        inDuration: 200,
        outDuration: 150,
        transitionMovement: 5,
      });
    }
}

module.exports.onStart = onStart;
