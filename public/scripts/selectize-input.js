const $ = require("jquery");
const selectize = require("selectize");

function instantiate_selectize() {
    /*
    Instantiates selectize search bar. An ajax POST query to Elasticsearch
    is defined. Selectize dropdown options are formatted in HTML for
    rendering.
    */
    const $select = $("#selectize").selectize({
        delimiter: ",",
        persist: false,
        create: false,
        labelField: "title",
        searchField: ["title", "authors"], // expand this
        placeholder: "Enter paper title, author name(s), journal, publication date and/or PubMed ID.",
        openOnFocus: false,
        highlight: false,
        maxItems: 10,

        // Since ES scores results, callback prevents selectize's
        // internal scoring algorithm.
        score: function() {
            return function() {
                return 1;
            }
        },

        // "search_ES" is called on user query.
        load: function(query, callback) {
            search_ES(query, callback, this);
        },

        // Render the dropdown options.
        render: {
            option: function(item, escape) {
                return render(item, escape);
            }
        },

        // Necc. to allow enter key to submit forms
        plugins: ["enter_key_submit"],
        onInitialize: function() {
            this.on("submit", function() {
                this.$input.closest("form").submit();
            }, this);
        }
    });

    // Add event listener to the search bar to ensure dropdown is not displayed when selectize is
    // empty, and to set "GO!" button state.
    add_selectize_listener($select[0].selectize);
}

/*
Adds a "onKeyDown" event listener to the selectize search bar. If the earch bar is not empty and
the user hits enter, a click event is registered on the search button.
References:
   - https://github.com/selectize/selectize.js/issues/78#issuecomment-104990055
   - https://stackoverflow.com/a/12293655
*/
selectize.define("enter_key_submit", function(options) {
    let self = this;
    let goButton = $("#selectize-go-button");

    this.onKeyDown = ((event) => {
        let original = self.onKeyDown;

        return function(event) {
            // this.items.length MIGHT change after event propagation.
            // We need the initial value as well. See next comment.
            let initialSelection = this.items.length;
            original.apply(this, arguments);

            // Use `.key` instead.
            if (event.key !== "Enter") {
                return;
            }
            // Necessary because we don't want this to be triggered when an option is selected with
            // enter after pressing DOWN key to trigger the dropdown options
            else if (initialSelection && initialSelection === this.items.length &&
                this.$control_input.val() === "") {
                self.blur(); // Makes the keyboard go away on mobile
                goButton.click(); // Register click on the button, initiatiating search
            }
            // No need to `return false;`
            event.preventDefault();
        };
    })();
});

function search_ES(query, callback, selectize) {
    /*
    Given user input into the selectize search bar, query Elasticsearch
    for the relevant papers.
    */

    if (!query.length) {
        selectize.clearOptions();
        selectize.refreshOptions(false);
        return callback();
    }

    // Sends an ajax POST request to the server with user query as data.
    $.ajax({
        url: "/selectize_query",
        type: "POST",
        data: {
            "value": query
        },

        // Temporary error callback.
        // TODO: add proper handling in future versions.
        error: function() {
            console.log("Ajax POST request error in search_ES.");
            callback();
        },

        // On successful query, extract relevant information to be
        // displayed in selectize dropdown.
        success: function(response) {

            // Clear any entries in dropdown first.
            selectize.clearOptions();

            let formatted_response = format_response(response);

            callback(formatted_response);
        }
    });
}

function format_response(response) {
    /*
    Formats Elasticsearch response to be rendered in selectize dropdown.
    */

    // Get hits from "response".
    let hits = response.hits.hits;

    // Array to store formatted responses in.
    let formatted_arr = [];

    // Iterate over "hits" and store object of formatted paper
    // information in "formatted_arr".
    for (let hit of hits) {

        // Store author list in a string.
        let authorString = "";

        // Iterate over authors and format names appropriately.
        for (let author of hit._source.authors) {

            let formatted_author = `${author["Initials"]} ${author["LastName"]},   `;

            authorString += formatted_author
        }

        // Remove comma and spaces added at the end of the last author.
        authorString = authorString.slice(0, -4);

        // Add results to "formatted_arr".
        formatted_arr.push({
            value: hit._id,
            title: hit._source.title,
            authors: authorString,
            journal: hit._source.journal,
            pubDateString: `${hit._source.pub_date.Month} ${hit._source.pub_date.Year}`
        });
    }

    return formatted_arr;
}

function render(item, escape) {
    /*
    Returns HTML to render in selectize dropdown.
    */

    let HTML_string =
    `<div class="container-fluid selectize-option">
       <div class="row text-center">
          <div class="col"><p class="selectize-option-title">${item.title}</p></div>
       </div>
      <div class="row">
        <div class="col-sm text-sm-center text-md-right">
          <h6><span id="modal-publisher" class="badge orange d-inline-block text-truncate max-width-250">
            ${item.journal}
          </h6>
        </div>
        <div class="col-sm text-sm-center text-md-left">
          <h6><span id="modal-published-date" class="badge stylish-color d-inline-block text-truncate max-width-250">
            ${item.pubDateString}
          </h6>
        </div>
      </div>
      <div class="row">
        <div class="col text-center">
          <p class="selectize-option-authors">${item.authors}</p>
        </div>
      </div>
    </div>`;

    return (HTML_string);
}

function add_selectize_listener(selectize) {
    /*
    Adds a "change" event listener to the selectize search bar. If the
    search bar is empty, the dropdown is cleared and the 'GO!' button is
    disabled. If it is not empty, the 'GO!' button is enabled.
    */
    selectize.on("change", function() {

        // First, if the query is empty, ensure dropdown is not
        // displayed.
        selectize.clearOptions();
        selectize.refreshOptions(true);

        // Get items currently in selectize search bar.
        let items = selectize.items;

        // Get 'GO!' button element.
        let goButton = $("#selectize-go-button");

        // Next, determine state of 'GO!' button. If the search bar is
        // not empty, button is enabled - otherwise disabled.
        if (items.length > 0) {
            goButton.prop("disabled", false);
        } else if (items === undefined || items.length === 0) {
            goButton.prop("disabled", true);
        }
    });
}

module.exports.instantiate_selectize = instantiate_selectize;
