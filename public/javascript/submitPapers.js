// Define submit button behaviour.
var submit_button = $('#selectize_submit');
submit_button.click(() => {submit();});
submit_button.keypress(function(event) {
  if(event.which == 13) {
    submit();
  }
});

// Action to take when user presses submit.
function submit(){

  var seeds = document.getElementById('selectize').value.split(',');

  $.ajax({
    url: "/submit_paper",
    method: "POST",
    dataType: "json",
    data: {"seeds": seeds},//, "n_results": slider_nResults},
    cache: false,
    timeout: 0,
    beforeSend: function() {
      $('#selectize_submit').prop('disabled', true);

      $('#front-page').fadeOut(600, function() {
          $('#loading').fadeIn(600);
      });

    },
    complete: function() {
      //called when complete
      console.log('process complete');
      // console.log(slider_nResults);
      // document.getElementById('paper-select-div').style.display = 'none';
      // document.body.innerHTML = "<div id='test-div'><h3>Submitted.</h3></div>";
    },

    success: function(res) {

      makeCyto(res);
    },

    error: function(jqXHR, status, err) {
      console.log(err);
    },
  });
}

// Function to run when user refines selection.
function refine(refined_papers) {

  var seeds = Object.keys(refined_papers);

  $.ajax({
    url: "/submit_paper",
    method: "POST",
    dataType: "json",
    data: {"seeds": seeds},//, "n_results": slider_nResults},
    cache: false,
    timeout: 0,
    beforeSend: function() {
      // $('#selectize_submit').prop('disabled', true);
      cy.elements().remove();

      // console.log(cy.elements());
      $('#option_buttons_div').fadeOut(900);
      $('#slider-div').fadeOut(600, function () {
        $('#nResultsSlider').nstSlider('teardown');
      });
      $('#loading').fadeIn(600);

    },
    complete: function() {
      //called when complete
      console.log('process complete');
    },

    success: function(res) {

      makeCyto(res);
    },

    error: function(jqXHR, status, err) {
      console.log(err);
    },
  });

}

// Function to map date to hsla lightness.
function getLightness(pubYears, Lmin, Lmax, Dmin, Dmax) {

  var m = (Lmax - Lmin) / (Dmin - Dmax);
  var b = Lmax - m * Dmin;

  var lightArray = [];
  for (pubYear of pubYears) {
    lightArray.push(m * pubYear + b);
  }

  return lightArray;
}


// Function that constructs the Cytoscape object.
function makeCyto(res) {

  var nodes = res.nodes;
  var relationships = res.relationships;
  var seeds = res.seeds;
  var curr_seed_paper_ids = [];

  // Find max and min publishing years.
  var max_date = 0;
  var min_date = 9999;
  var dateArray = [];
  var idScoreArray = [];

  // Get maximum and minimum publishing years, as well as all scores.
  for (var key in nodes) {

    var pub_year = nodes[key].pub_year;
    dateArray.push(pub_year);

    if (seeds.includes(parseInt(key))) {
      var curr_score = Infinity;
      idScoreArray.push([key, curr_score]);
    } else {
      var curr_score = nodes[key].score;
      idScoreArray.push([key, curr_score]);
    }

    if (pub_year < min_date) {
      min_date = pub_year;
    }

    if (pub_year > max_date) {
      max_date = pub_year;
    }
  }

  // Get sorted list of node keys, descending by score.
  idScoreArray.sort(function compare(kv1, kv2) {
    return kv1[1] - kv2[1]
  })
  idScoreArray.reverse()

  // Array containing node keys sorted in descending order by score.
  var descIDs = [];
  for (arr of idScoreArray) {
    descIDs.push(arr[0])
  }

  console.log(descIDs)

  var lightArray = getLightness(dateArray, 50, 100, min_date, max_date);

  var counter = 0;

  for (var key in nodes) {

    var lightness = lightArray[counter];

    // Check if current node is a seed.
    if (seeds.includes(parseInt(key))) {
      var size = '20px';
      var background_colour = 'red';
      var background_colour_store = 'red';
      var border_style = 'double';
      var border_opacity = 0.6
      curr_seed_paper_ids.push(nodes[key].paper_id);
    } else {
      var size = (3000 * nodes[key].score + 10).toString() + 'px';
      var background_colour = 'hsla(41,100%,' + lightness.toString() + '%,0.3)'
      var background_colour_store = 'hsla(41,100%,' + lightness.toString() + '%,0.3)'
      var border_style = 'solid';
      var border_opacity = 0.3
    }

    // Check local storage to see if current node is a read paper.
    if (localStorage['ids']) {
      var stored = JSON.parse(localStorage['ids']);

      if (stored[key]) {
        var background_colour = 'purple';
        var background_colour_store = 'hsla(41,100%,' + lightness.toString() + '%,0.3)'
      }
    }

    var curr_node = nodes[key];

    cy.add({
      data: {
        id: key,
        paper_id: curr_node.paper_id,
        score: curr_node.score,
        title: curr_node.title,
        authors: curr_node.authors,
        abstract: curr_node.abstract,
        pub_date: curr_node.pub_date,
        journal: curr_node.journal,
        initial_colour: background_colour_store
      },
      style: {
        // 'display': 'none',
        'height': size,
        'width': size,
        'background-color': background_colour,
        'border-style': border_style,
        'border-opacity': border_opacity
      },
      classes: 'cy-nodes'
    })

    counter += 1;
  }

  for (var rel of relationships) {

    // If there is a direct reference from one seed to another, colour it differently.
    if (seeds.includes(rel[0]) && seeds.includes(rel[1])) {
      cy.add({
        data: {id: rel[0].toString() + '_' + rel[1].toString(), source: rel[0], target: rel[1]},
        style: {'line-color': 'red'}
      });
    } else {

      cy.add({
        data: {id: rel[0].toString() + '_' + rel[1].toString(), source: rel[0], target: rel[1]}
      });
    }
  }

  cy.on('layoutstop', function (event) {
    console.log('layoutstopped');

    // number of nodes.
    var n_nodes = cy.nodes().length;

    $('#nResultsSlider').remove();
    $('#slider-div').append('<div id="nResultsSlider" class="nstSlider" data-range_min="10" data-range_max=' + n_nodes.toString() + ' data-cur_min=' + n_nodes.toString() + ' data-cur_max="10"><div class="bar"></div><div class="leftGrip"></div><div class="slider-line"></div></div>')

    // Compute two dictionaries of keys as slider values and values as arrays of paper IDs to show/ hide respectively.
    var show_dict = {};
    var hide_dict = {};

    for (leftValue of [...Array(n_nodes).keys()]) {

      show_dict[leftValue] = [];
      hide_dict[leftValue] = [];

      for (IDindex of [...Array(n_nodes).keys()]) {

        if (IDindex <= leftValue) {
          show_dict[leftValue].push(descIDs[IDindex])
        } else {
          hide_dict[leftValue].push(descIDs[IDindex])
          // cy.nodes().filter(node => node.connectedEdges(":visible").size() === 0).hide()
        }
      }
    }


    // Define slider behaviour.
    $('#nResultsSlider').nstSlider({
        crossable_handles: false,
        left_grip_selector: ".leftGrip",
        value_bar_selector: ".bar",
        highlight: {
            grip_class: "gripHighlighted",
            panel_selector: ".highlightPanel"
        },
        value_changed_callback: function(cause, leftValue, rightValue) {
            $('.leftLabel').text(leftValue);

            var show_IDs = show_dict[leftValue];
            var hide_IDs = hide_dict[leftValue];

            if (show_IDs !== undefined && show_IDs.length != 0) {
              for (show_ID of show_IDs) {
                cy.nodes().$id(show_ID).show();
              }
            }

            if (hide_IDs !== undefined && hide_IDs.length != 0) {
              for (hide_ID of hide_IDs) {
                cy.nodes().$id(hide_ID).hide();
              }
            }

            // // Show and hide nodes accordingly.
            // for (IDindex of [...Array(n_nodes).keys()]) {
            //   if (IDindex <= leftValue) {
            //     cy.nodes().$id(descIDs[IDindex]).show()
            //   } else {
            //     cy.nodes().$id(descIDs[IDindex]).hide()
            //     cy.nodes().filter(node => node.connectedEdges(":visible").size() === 0).hide()
            //   }
            // }
        },
    });
  })

  $('#option_buttons_div').fadeIn(900);

  // $('#loading').hide();
  $('#loading').fadeOut(600, function () {

    $('#cy').show(0, function () {
      cy.resize();
      console.log('shown');
      cy.ready(() => {
        $('#option_buttons_div').fadeIn(600, function() {
            $('#slider-div').fadeIn(600);
        });
        console.log('ready');
        cy.center();

        cy.layout({
          name: 'cose',
          randomize: true,
          fit: true,
          padding: 50,
          // animate: 'end',
          animate: true,
          animationEasing: 'spring(0.3, 0.7)',
          animationDuration: 3000,
          // animationThreshold: 2000,
        }).run();



        prepare_vex(seeds, curr_seed_paper_ids);
      });
    })
  });
}
