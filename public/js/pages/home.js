var Page_Home = new function () {
    var elements = {};

    this.init = function (target) {
        elements.container = target;

        display_body();
    };

    function display_body() {
        elements.container.html('<h1>Jerek\'s RPG Tools</h1>\
\
        <p>A bunch of RPG Tools will be here. Keep in mind that ALL DATA is saved IN YOUR BROWSER! If you clear your browsers local history all data will be LOST! Also because of this, you can\'t load the same data across different computers/devices. Eventually it will be saving in a proper database, but for now using browser local storage is much faster for rapid development.</p>\
\
        <h2>Usable Sections</h2>\
        <p>The first section prepared was the <a href="#dice">Dice roller</a>. The [d] option (to choose any number of dice with any number of sides) does not yet function, but the others all do, and the rolls are stored between sessions. You can view the timestamp for each roll by holding your mouse over the roll result.</p>\
        <p>The <a href="#character">Character page</a> is the newest section. Here you can roll based on your character\'s stats. It currently only supports the Deciv system, but it will support more (Pathfinder, D&amp;D) eventually. Rolls are saved across all pages, so loading the <a href="#dice">Dice page</a> after rolling a stat will show the rolls there as well!</p>\
\
        <h2>Future Pages</h2>\
        <p>Statistics! Once the Character and Dice pages are a little more refined I\'ll add a Stats page where you can see historical data formatted for analysis. Maybe even some nice charts? :)</p>\
        <p>The Initiative tool will allow you to roll initiative for all party members and (and some number of non-party members) at once, and an order of characters will be instantly given.</p>\
        <p>Similarly, the Watches tool will roll for which character is on watch when an event happens, and (maybe eventually) whether they pass their roll to be aware of the impending event.</p>');
    }
};
