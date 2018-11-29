const vex = require('vex-js');
vex.registerPlugin(require('vex-dialog'));
vex.defaultOptions.className = 'vex-theme-wireframe';

const refine_button = require("./refine-search.js");

function create_modal(node) {
    /*
    */
    
    let title = node.title;
    let authors = node.authors;
    let journal = node.journal;
    
    let pub_date = node.pub_date;
    let pub_year = pub_date.Year;
    let pub_month = '';
    if ("Month" in pub_date) {
        pub_month = pub_date.Month.toString();
    }

    let pub_date_string = "No date available.";
    if (pub_year) {
        pub_date_string = pub_month + '  ' + pub_year;
    }

    let abstract = node.abstract;
    let id = node.id;

    // Format author string.
    let author_string = format_authors(authors);

    vexInstance = vex.open({
        unsafeContent:
        '<span class="vex-paper-info">' +
            '<div id="vex-header-div">' + 
                '<button id="add-to-refine-button" class="mdc-button" ' +
                'paper=' + id + '>' +
                    '+' + 
                '</button>' +
                '<div id="vex-title-div">' +
                    title +
                '</div>' +
                '<div id="date-journal-div">' +
                    '<span>' +
                        pub_date_string +
                    '</span>' +
                    '<span id="journal-span">' +
                        journal +
                    '</span>' +
                '</div>' +
            '</div>' +
            '<div id="author-div">' +
                author_string +
            '</div>' +
            '<div id="abstract-div">' +
                '<p>' +
                    abstract +
                '</p>' +
            '</div>' +
            '<a href="https://www.ncbi.nlm.nih.gov/pubmed/?term=' +
                id.toString() + '" target="_blank">PubMed' + 
            '</a>' +
        '</span>'
    });

    refine_button.add_refine_button_listener(id, node);
    
}

function format_authors(authors) {
    /*
    Formats author list for use in modal.
    */

    let author_string = '';

    // Add author names to 'author_string'.
    for (author of authors) {
        let first_name = author.FirstName;
        let last_name = author.LastName;

        author_string += first_name + ' ' + last_name + ', '
    }

    // Remove final comma and space at end of 'author_string'.
    author_string = author_string.slice(0, -2);

    return author_string;
}

function create_refined_button() {
    /* 
    */


}

module.exports.create_modal = create_modal;