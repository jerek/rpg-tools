window.Page_404 = new function () {
    // ********************* //
    // ***** VARIABLES ***** //
    // ********************* //

    /** @type {Object} References to various DOM elements. */
    const elements = {};

    // ********************* //
    // ***** FUNCTIONS ***** //
    // ********************* //

    // ------ //
    // PUBLIC //
    // ------ //

    this.init = function (target) {
        elements.container = target;

        display_body();
    };

    // ------- //
    // PRIVATE //
    // ------- //

    function display_body() {
        elements.container.append($('<h1/>', {
            text: '404',
        }));
    }
};
