function prepare_vex(seeds, seed_paper_ids, lightArray) {

  // JSON containing papers to add to 'refined search' feature.
  var refined_papers = {};
  for (seed of seed_paper_ids) {
    refined_papers[seed] = true;
  }

  cy.nodes().on('click', function(e) {


    var nodeEdges = e.target.connectedEdges();

    // for (n_edge in [...Array(nodeEdges.length)]) {
    //   nodeEdges[n_edge].style({
    //     'line-color': '#ccc',
    //   });
    // }

    var paper_id = this.data()['paper_id'];
    var title = this.data()['title'];
    var clicked_node = this;

    console.log(e.target);

    // Determine the class of the 'add to refine search' button. It is either pressed or not pressed.
    var refine_button_html_string = '';

    // Button pressed.
    if (refined_papers[paper_id]) {
      refine_button_html_string = '<button id="add_refine_button" class="button button-primary button-circle tippy_add_refine_ref add_refine_button_pressed">+</button>';
    // Button not pressed.
    } else {
      refine_button_html_string = '<button id="add_refine_button" class="button button-primary button-circle tippy_add_refine_ref">+</button>';
    }

    vexInstance = vex.open({
      unsafeContent:
      '<span class=vex-paper-info> <div id="vex_header_div"> <div id="vex_title_div">' + title + '</div>' +
      refine_button_html_string +
      '</div> <div id="date_journal_div"> <span>' + this.data().pub_date + '</span> <span id="journal_span">' +
      this.data().journal + '</span> </div> <div id="author_div">' + this.data()['authors'] + '</div> <div id="abstract_div"> <p>' +
      this.data()['abstract'] + '</p> </div> <a href="https://www.ncbi.nlm.nih.gov/pubmed/?term=' +
      paper_id.toString() + '" target="_blank">PubMed</a></span>'
    });

    // var tpAddRefine = new tippy('.tippy_add_refine_ref', {
    //   content: 'Add to refined search.',
    //   delay: 100,
    //   arrow: true,
    //   trigger: 'manual'
    // }).tooltips[0]
    //
    // $('#add_refine_button').on('mouseover', () => tpAddRefine.show());

    $('#add_refine_button').click(function() {

      console.log(e.target);
      console.log($('#add_refine_button'));

      // Already added to refine search.
      if (refined_papers[paper_id]) {
        delete refined_papers[paper_id];
        // this.style['border-style'] = 'solid';
        e.target.style({'border-style': 'solid', 'border-opacity': '0.3'});
        $('#add_refine_button').removeClass('add_refine_button_pressed');
      } else {
        refined_papers[paper_id] = true;
        // this.style['border-style'] = 'double';
        e.target.style({'border-style': 'double', 'border-opacity': '0.6'});
        $('#add_refine_button').addClass('add_refine_button_pressed');
      }

      // Disable 'refine search' button if 'refined_papers' is now empty, enable it otherwise.
      if (jQuery.isEmptyObject(refined_papers)) {
        $('#refine_button').prop('disabled', true);
      } else {
        $('#refine_button').prop('disabled', false);
      }
    });
  });

  // On click of 'refine search' button, call 'refine' function.
  $('#refine_button').click(() => {
    refine(refined_papers)
    $('#refine_button').off('click');
  });

  let tips = {};

  for (let node of Array.from(cy.nodes())){

    let ref = node.popperRef();
    // console.log(ref);

    let tp = new tippy(ref, {
      html: (() => {
        let content = document.createElement('div');
        content.innerHTML = '<span><p>' + node.data().title + '</p><p>' + node.data().pub_date + '</p></span>';
        return content;
      })(),
      trigger: 'manual',
      arrow: true,
      // interactive: true,
      theme: 'paperInfo'
    }).tooltips[0];

    tips[node.id()] = tp;
  }

  cy.nodes().on('mouseover', (event) => {
    tips[event.target.id()].show();
    // var nodeEdges = event.target.connectedEdges();
    //
    // for (n_edge in [...Array(nodeEdges.length)]) {
    //   nodeEdges[n_edge].style({
    //     'line-color': '#555',
    //   });
    // }
  });

  cy.nodes().on('mouseout', (event) => {
    tips[event.target.id()].hide();
    // var nodeEdges = event.target.connectedEdges();
    //
    // for (n_edge in [...Array(nodeEdges.length)]) {
    //   nodeEdges[n_edge].style({
    //     'line-color': '#ccc',
    //   });
    // }
  });

  cy.nodes().on('mousedown', (event) => tips[event.target.id()].hide());


  cy.$('node').on('cxttap', function(e) {
    // e.target.classess('readPaper');
    // cy.nodes().addClass('readPaper');
    // e.addClass('readPaper');

    console.log(e.target.data().id);

    var target_id = parseInt(e.target.data().id);

    var initial_colour = e.target.data().initial_colour;

    if (localStorage['ids']) {
      var stored = JSON.parse(localStorage['ids']);

      if (stored[target_id]) {
        delete stored[target_id];
        localStorage['ids'] = JSON.stringify(stored);

        console.log(seeds);
        console.log(typeof(target_id))
        console.log(seeds.includes(target_id));



        if (seeds.includes(target_id)) {
          e.target.style({'background-color': 'red'})
        } else {
          e.target.style({'background-color': initial_colour});
        }
      }

      else {
        stored[target_id] = true;
        localStorage['ids'] = JSON.stringify(stored);
        e.target.style({'background-color': 'purple'});
      }
    }
    else {
        var to_store = {};
        to_store[target_id] = true;
        localStorage['ids'] = JSON.stringify(to_store);
        e.target.style({'background-color': 'purple'});
    }

    // if (e.target.style()['background-color'] == 'orange') {
    //     e.target.style({'background-color': 'purple'})
    // }
    //
    // else if (e.target.style()['background-color'] == 'purple') {
    //     e.target.style({'background-color': 'orange'})
    // }

    console.log(e.target);
  })
}


// Function to store read papers in the user's browser cache.
function store_read(thisNode) {
  // console.log(event.target.id());
  // console.log(event.target[0].style['background-color']);
  console.log(thisNode);
  thisNode.classes('readPaper');
}
