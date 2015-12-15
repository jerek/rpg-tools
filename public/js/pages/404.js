var Page_404 = new function() {
    var elements = {};

    this.init = function(target) {
        elements.container = target;

        display_body();
    };

    function display_body() {
        elements.container.append($('<h1/>', {
            text: '404'
        }));
    }
};
