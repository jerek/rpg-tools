var Utility = new function() {
    /**
     * @param {string|null} name
     * @param {jQuery|HTMLElement} [target]
     * @param {object|string} [options] If it's string, it's treated as the "element" property of the options object.
     * @returns {*|jQuery|HTMLElement}
     */
    this.addElement = function(name, target, options) {
        switch (typeof options) {
            case 'string':
                options = {
                    element: options
                };
                break;
            case 'object':
                // do nothing
                break;
            default:
                options = {};
        }

        if (!options['class']) {
            options['class'] = name;
        }

        var nodeType = 'div';
        if (options.element) {
            nodeType = options.element;
            delete options.element;
        }

        var prepend = !!options.prepend;
        delete options.prepend;

        var element = $('<' + nodeType + '/>', options);

        if (target) {
            if (prepend) {
                element.prependTo(target);
            } else {
                element.appendTo(target);
            }
        }

        return element;
    };

    /**
     * @param {number} sides
     * @returns {number}
     */
    this.roll = function(sides) {
        return Math.floor((Math.random() * sides) + 1);
    };

    /**
     * @returns {boolean}
     */
    this.returnFalse = function () {
        return false;
    };

    /**
     * @param {string|*} message Can only be non-string when consoleOnly is true.
     * @param {boolean} [consoleOnly]
     */
    this.error = function(message, consoleOnly) {
        if (consoleOnly === true) {
            if (typeof console != 'undefined' && console && typeof console.error == 'function') {
                console.error(message);
            }
        } else {
            alert(message);
        }
    };
};
