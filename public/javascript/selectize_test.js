function loadSelectize(){

  var $select = $('#selectize').selectize({
      delimiter: ',',
      persist: false,
      create: false,
      labelField: 'name', // need short-form title here
      searchField: ['name', 'authors'],
      placeholder: 'Enter paper title, author name(s) and/or PubMed ID.',
      openOnFocus: false,
      highlight: false,
      // restrict maximum number of entries
      score: function() {return function() {return 1;};},
      load: function(query, callback) {
        var self = this;
        if (!query.length) {
          self.clearOptions();
          self.refreshOptions(false);
          return callback();
        }
        $.ajax({
          url: '/character_input',
          type: 'POST',
          data: {'value' : query},
          error: function() {
            console.log('error');
            callback();
          },
          success: function(res) {
            self.clearOptions();
            // remove options
            // render HTML
            // console.log(res.hits.hits[0]);
            // console.log(res.hits.hits[0]._source.title);
            let callbackArg = [];
            for (resObj of res.hits.hits) {
              var author_string = '';
              for (author_dict of resObj._source.authors) {
                author_string += author_dict['LastName'] + ' ' + author_dict['Initials'] + ',   ';
              }
              author_string = author_string.slice(0, -4);

              callbackArg.push({value: resObj._id, name: resObj._source.title, authors: author_string})
            };
            callback(callbackArg);
          }
        })
      },
      render: {
        option: function(item, escape) {
          return '<div class="paper-option"><p class="paper-title">' + escape(item.name) + '</p>' +
                           '<p class="paper-authors">' + escape(item.authors) + '</p></div>'
        }
      }
  });

  var paper_selectize = $select[0].selectize;
  paper_selectize.on('change', () => {
    // if query is empty, kill dropdown
    paper_selectize.clearOptions()
    paper_selectize.refreshOptions(true);

    if (paper_selectize.items.length > 0) {
      $('#selectize_submit').prop('disabled', false);
      $('#selectize_submit').addClass('button-glow');
    }

    // if no items exist, disable submit button.
    if (paper_selectize.items === undefined || paper_selectize.items.length == 0) {
      $('#selectize_submit').prop('disabled', true);
      $('#selectize_submit').removeClass('button-glow');
    }
  });
}
// paper_selectize.addOption({value: 6, name: 'Added Paper', authors: 'Some Guy'});
// paper_selectize.refreshOptions(false);
