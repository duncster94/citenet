var slider_nResults;

function loadOptions() {

  


  // $('#nResultsSlider').nstSlider({
  //     crossable_handles: false,
  //     left_grip_selector: ".leftGrip",
  //     value_bar_selector: ".bar",
  //     highlight: {
  //         grip_class: "gripHighlighted",
  //         panel_selector: ".highlightPanel"
  //     },
  //     value_changed_callback: function(cause, leftValue, rightValue) {
  //         $('.leftLabel').text(leftValue);
  //         slider_nResults = leftValue;
  //     },
  // });

  // $('#citeCountSlider').nstSlider({
  //     crossable_handles: false,
  //     left_grip_selector: ".leftGrip",
  //     right_grip_selector: ".rightGrip",
  //     value_bar_selector: ".bar",
  //     highlight: {
  //         grip_class: "gripHighlighted",
  //         panel_selector: ".highlightPanel"
  //     },
  //     value_changed_callback: function(cause, leftValue, rightValue) {
  //         $('#leftCiteCount').text(leftValue);
  //         $('#rightCiteCount').text(rightValue);
  //
  //         sliderCountMin = leftValue;
  //         sliderCountMax = rightValue;
  //     },
  // });


  var option_tipster = $('.tipster').tooltipster({
    theme: 'tooltipster-shadow',
    trigger: 'click',
    animation: 'fade',
    delay: 300,
    animationDuration: 650,
    interactive: true,
    side: ['bottom', 'top', 'left', 'right'],
    functionBefore: function(){

    },
    functionReady: function(){
      // $(option_tipster).hide();
      // $('#test-popup').ready($('#test-popup').show());
      // $('#test-popup').fadeIn({duration: 5000});
    }
  });
}

// Function to execute on DOM load.
function whenReady(fadeTime, fadeOffset){

  $('#loading').hide();
  $('#selectize_submit').prop('disabled', true);
  $('#selectize_submit').removeClass('button-glow');
  loadSelectize();
  loadOptions();
  fadeSubmit(fadeTime, fadeOffset);

}

// Fade in elements.
function fadeSubmit(fadeTime, fadeOffset){

  // $('#paper-select-div').fadeIn({
  //   duration: fadeTime,
  //   step: function(now) {
  //     if (now > fadeOffset) {
  //       $('#paper-submit-options-div').fadeIn({
  //         duration: fadeTime,
  //         step: function(now2) {
  //           if (now2 > fadeOffset) {
  //             $('#paper-submit-div').fadeIn(fadeTime, function(){});
  //           }
  //         }
  //       });
  //     }},
  //   })

  $('#paper-select-div').fadeIn({
    duration: fadeTime,
    step: function(now) {
      if (now > fadeOffset) {
        $('#paper-submit-div').fadeIn({fadeTime, function(){}});
      }},
    })
}

// On load:
$(document).ready(whenReady(600, 0.5));
