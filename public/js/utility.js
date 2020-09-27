window.Utility = new function () {
    /**
     * @param {string|null}        name
     * @param {jQuery|HTMLElement} [target]
     * @param {Object|string}      [options] If it's string, it's used as the "element" property of the options object.
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

        let nodeType = 'div';
        if (options.element) {
            nodeType = options.element;
            delete options.element;
        }

        let prepend = !!options.prepend;
        delete options.prepend;

        let element = $('<' + nodeType + '/>', options);

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
     * @param {string}             text
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
     * @param {string|*} message       If not a string, effectively sets consoleOnly to true.
     * @param {boolean}  [consoleOnly]
     */
    this.error = function (message, consoleOnly) {
        if (consoleOnly === true || typeof message !== 'string') {
            if (typeof console !== 'undefined' && console && typeof console.error === 'function') {
                console.error(message);
            }
        } else {
            alert(message);
        }
    };

    /**
     * @param {number[]} numbers
     * @returns {number}
     */
    this.average = function (numbers) {
        let total = 0;
        let len = numbers.length;
        for (let i = 0; i < len; i++) {
            total += numbers[i];
        }

        return total / len;
    };

    this.propertyAverage = function (objectOrArray, property) {
        let numbers = [];
        for (let i in objectOrArray) {
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
        let updates = [];

        for (let property in newObject) {
            if (
                newObject.hasOwnProperty(property) &&
                (newObject[property] !== oldObject[property] || typeof oldObject !== 'object' || !oldObject)
            ) {
                updates.push(property);
            }
        }

        return updates;
    };

    /**
     * @param {Object}   object
     * @param {function} [sortFunc]
     * @returns {*[]}
     */
    this.sortObject = function (object, sortFunc) {
        let result = [];

        for (let property in object) {
            if (object.hasOwnProperty(property)) {
                result.push(object[property]);
            }
        }

        result.sort(sortFunc);

        return result;
    };
};
