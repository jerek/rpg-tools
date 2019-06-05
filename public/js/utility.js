var Utility = new function () {
    /**
     * @param {string|null} name
     * @param {jQuery|HTMLElement} [target]
     * @param {object|string} [options] If it's string, it's treated as the "element" property of the options object.
     * @returns {jQuery}
     */
    this.addElement = function (name, target, options) {
        switch (typeof options) {
            case 'string':
                options = {
                    element: options,
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
     * @param {string} text
     * @param {jQuery|HTMLElement} target
     */
    this.addText = function (text, target) {
        $(target).append(document.createTextNode(text));
    };

    /**
     * @param {number} sides
     * @returns {number}
     */
    this.roll = function (sides) {
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
    this.error = function (message, consoleOnly) {
        if (consoleOnly === true) {
            if (typeof console != 'undefined' && console && typeof console.error == 'function') {
                console.error(message);
            }
        } else {
            alert(message);
        }
    };

    /**
     * @param {Array} numbers
     * @returns {number}
     */
    this.average = function (numbers) {
        var total = 0;
        for (var i = 0, len = numbers.length; i < len; i++) {
            total += numbers[i];
        }

        return total / len;
    };

    this.propertyAverage = function (objectOrArray, property) {
        var numbers = [];
        for (var i in objectOrArray) {
            if (objectOrArray.hasOwnProperty(i) && $.isNumeric(objectOrArray[i][property])) {
                numbers.push(parseInt(objectOrArray[i][property]));
            }
        }

        if (!numbers.length) {
            return 0;
        }

        return Utility.average(numbers);
    };

    this.getObjectUpdateList = function (oldObject, newObject) {
        var updates = [];

        for (var property in newObject) {
            if (typeof oldObject != 'object' || !oldObject || (newObject.hasOwnProperty(property) && newObject[property] !== oldObject[property])) {
                updates.push(property);
            }
        }

        return updates;
    };

    /**
     * @param {object} object
     * @param {function} [sortFunc]
     * @returns {Array}
     */
    this.sortObject = function (object, sortFunc) {
        var result = [];

        for (var property in object) {
            if (object.hasOwnProperty(property)) {
                result.push(object[property]);
            }
        }

        result.sort(sortFunc);

        return result;
    };
};
