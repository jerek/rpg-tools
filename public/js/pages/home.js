var Page_Home = new function() {
    var elements = {};

    this.init = function(target) {
        elements.container = target;

        display_body();
    };

    function display_body() {
        elements.container.html('<h1>Jerek\'s RPG Tools</h1>\
\
        <p>Only the <a href="#dice">Dice roller</a> is ready at the moment. The [d] option (to choose any number of dice with any number of sides) does not yet function, but the others all do, and the rolls are stored between sessions. You can view the timestamp for each roll by holding your mouse over the roll result.</p>\
\
        <p>In the future the Initiative tool will allow you to roll initiative for all party members and (and some number of non-party members) at once, and an order of characters will be instantly given.</p>\
\
        <p>Similarly, the Watches tool will roll for which character is on watch when an event happens, and (maybe eventually) whether they pass their roll to be aware of the impending event.</p>');
    }
};
