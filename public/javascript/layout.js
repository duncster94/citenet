var cy = cytoscape({
  container: document.getElementById('cy'),

  elements: [
  ],

  style: [ // the stylesheet for the graph
  {
    selector: 'node',
    style: {
      'background-color': '#666',
      'border-width': '4px',
      'border-opacity': '0.3',
      // 'label': 'data(paper_id)'
    }
  },

  {
    selector: 'edge',
    style: {
      'width': 3,
      'line-color': '#ccc',
      'target-arrow-color': '#ccc',
      'target-arrow-shape': 'triangle',
    },
  },

  {
    selector: '.readPaper',
    style: {
      'background-color': 'purple'
    }
  }

  ],

  layout: {
    name: 'grid',
    rows: 1
  },

});

var cose_layout = cy.layout({
  name: 'cose',
  randomize: true,
  fit: true,
  padding: 50,
  animate: 'end',
  animationEasing: 'ease-out-sine',
  animationDuration: 1500,
  animationThreshold: 2000
});
