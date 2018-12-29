const $ = require("jquery");
const refine_button = require("./refine-search.js");
require("bootstrap");

function createModal(node, refinedPapers) {
    /*
    Creates the modal which appears on node click.
     */

    let title = node.title;
    let authors = node.authors;
    let journal = node.journal;

    let nodeId = node.id;

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

    // Fill in the modal contents for the given node
    $("#modal-title").html(title);
    $("#modal-publisher").html(journal);
    $("#modal-published-date").html(pub_date_string);
    $("#modal-authors").html(author_string);
    $("#modal-abstract").html(abstract);
    // Add href to publisher link out button
    $("#modal-publisher-link-out").attr("href", `https://www.ncbi.nlm.nih.gov/pubmed/?term=${id.toString()}`)
    // Action button should say "Add to Search" or "Remove from Search" depending on whether
    // or not it is queued.
    if (nodeId in refinedPapers) {
      $("#add-to-refine-button").html('Remove from Search<i class="fas fa-minus-square ml-2"></i>');
    } else {
      $("#add-to-refine-button").html("Add to search<i class='fas fa-plus-square ml-2'></i>");
    }

    // Add a listener to the refine button.
    refine_button.add_refine_button_listener(id, node, refinedPapers);

    // Trigger modal show event
    $('#abstract-modal').modal('show');

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

module.exports.createModal = createModal;
