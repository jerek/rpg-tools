var Page_Home = new function() {
    var elements = {};

    this.init = function(target) {
        elements.container = target;

        display_body();
    };

    function display_body() {
        elements.container.html('<h1>Jerek\'s RPG Tools</h1>\
\
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed et mi fermentum, finibus nunc a, volutpat felis. Aliquam et gravida quam. Pellentesque tempor lectus ac felis tristique, a hendrerit mauris faucibus. Proin posuere arcu erat, non pellentesque lacus pulvinar a. Nam efficitur nisi sit amet libero dignissim, maximus convallis magna vulputate. Integer ut est commodo nisi sodales dapibus. Mauris sed libero nunc. Donec commodo arcu eu diam consequat ornare. In hac habitasse platea dictumst. Donec nec varius dolor, ut egestas augue. Nam dui tortor, hendrerit id nibh non, varius pretium quam. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec a dui nec leo pellentesque finibus. Etiam consequat finibus tristique.</p>\
\
        <h2>This Is A Subheading</h2>\
\
        <p>Nulla elementum eleifend turpis, id mattis dui egestas ut. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Ut id nulla nec neque mattis iaculis. Duis efficitur felis maximus magna aliquam, vitae ullamcorper diam dapibus. Praesent congue porta nunc vel tristique. Cras id lorem id est elementum egestas et a leo. Phasellus tristique nisi sed orci efficitur ultrices. Quisque tincidunt accumsan cursus. Nulla ac enim eu neque tempor tincidunt ut vel arcu. Nunc ut dictum magna, a pellentesque magna. Vestibulum sed massa ac odio malesuada semper quis at augue.</p>\
\
        <p>Integer semper sapien id purus interdum semper. Curabitur ultrices efficitur lorem vel volutpat. Nam ornare vitae enim vitae euismod. Ut dictum augue ac felis volutpat laoreet. Aenean in ornare leo, non malesuada orci. Duis vel semper magna. Vivamus placerat risus sed massa pharetra gravida. Phasellus sit amet lacus enim. Curabitur luctus tempor turpis, ut dapibus dolor cursus a. Aliquam vel egestas ligula. Ut vel tellus congue, pretium nibh et, blandit ligula.</p>');
    }
};
