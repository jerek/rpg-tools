var Dice = new function() {
    var config = {
        animateRolls: true,
        dice: [ 'd', 4, 6, 8, 10, 12, 20, 100 ]
    };
    var elements = {};
    var rolls = null;

    /**
     * Get the result of a roll without effecting the DOM.
     *
     * @param options
     * @returns {object|undefined}
     */
    this.roll = function (options) {
        return data_roll(options);
    };

    /**
     * Fill the target element with dice controls.
     *
     * @param target {jQuery} The element to be emptied and filled.
     * @param [callback] {function} Function to call when options are changed. Passed a string of what option was changed.
     */
    this.displayControls = function(target, callback) {
        target.empty();

        if (!target.hasClass('dice-controls')) {
            target.addClass('dice-controls');
        }

        elements.controls = target;

        elements.animateControl = Base.addElement('dice-controls-animate', elements.controls, {
            element: 'a',
            text: 'Animation',
            click: function() {
                config.animateRolls = !config.animateRolls;
                data_save();
                if (typeof callback == 'function') {
                    callback('roll-animation');
                }
            },
            mousedown: Base.returnFalse
        });
        Base.addElement(null, elements.animateControl, {
            element: 'i',
            prepend: true,
            'class': 'fa fa-fw fa-' + (config.animateRolls ? 'check-square-o' : 'square-o')
        });

        elements.clearControl = Base.addElement('dice-controls-clear', elements.controls, {
            element: 'a',
            text: 'Clear',
            click: function() {
                if (!rolls || $.isEmptyObject(rolls)) {
                    if (typeof callback == 'function') {
                        callback('clear-rolls');
                    }
                } else {
                    if (confirm('Clear ALL roll data?')) {
                        rolls = {};
                        data_save();
                        if (typeof callback == 'function') {
                            callback('clear-rolls');
                        }
                    }
                }
            },
            mousedown: Base.returnFalse
        });
        Base.addElement(null, elements.clearControl, {
            element: 'i',
            prepend: true,
            'class': 'fa fa-fw fa-times'
        });
    };

    /**
     * Append a die roll button to the target.
     *
     * @param target {jQuery}
     * @param sides {number}
     * @param callback {function} Called when the button is clicked.
     */
    this.appendDie = function(target, sides, callback) {
        return Base.addElement('dice-die', target, {
            element: 'a',
            href: 'javascript:;',
            text: sides,
            click: callback.bind(null, sides)
        });
    };

    /**
     * Append a die result, and roll it if necessary.
     *
     * @param target {jQuery}
     * @param rollObjectOrOptions {object} If the "result" property is not found this is passed to data_roll. Must contain the "sides" property.
     * @param [suppressAnimation] {boolean} Whether to prevent animation of the property when it's added.
     */
    this.appendResult = function(target, rollObjectOrOptions, suppressAnimation) {
        if (typeof rollObjectOrOptions.result != 'number') {
            return;
            // rollObjectOrOptions = data_roll(rollObjectOrOptions); // TODO: This should replace the roll instead of creating a new one!
        }

        var animate = !suppressAnimation && config.animateRolls;
        var css = animate ?
            { opacity: '0' } :
            { color: '#111' };
        var die = Base.addElement('dice-die-result', target, {
            prepend: true,
            css: css
        });
        die
            .mouseenter((function (rollObject) {
                Base.addElement('dice-die-result-timestamp', this, {
                    text: DateFormat.format.prettyDate(rollObject.datetime + '.000'),
                    title: rollObject.datetime
                });
            }).bind(die, rollObjectOrOptions))
            .mouseleave(function () {
                $('.dice-die-result-timestamp', this).remove();
            });

        if (animate) {
            display_resultAnimation(die, rollObjectOrOptions, 0);

            setTimeout(function () {
                die.css({opacity: ''});
            }, 1);
        } else {
            die.html(rollObjectOrOptions.result);
        }
    };

    /**
     * Get the current setting for animating rolls.
     *
     * @returns {boolean}
     */
    this.getAnimation = function() {
        return config.animateRolls;
    };

    /**
     * Set the current setting for animating rolls.
     *
     * @returns {boolean}
     */
    this.setAnimation = function(value) {
        config.animateRolls = value;
    };

    /**
     * Get all rolls or rolls of a particular number of sides.
     *
     * @param [sides] {number}
     * @returns {*}
     */
    this.getRolls = function (sides) {
        if (sides) {
            return rolls && rolls[sides] || [];
        } else {
            return rolls || {};
        }
    };

    /**
     * Handle the animation of showing a roll result.
     *
     * @param target {jQuery}
     * @param rollObject {object}
     * @param count {number} How many times this function has looped.
     * @param [current] {number} The currently displayed false result.
     */
    function display_resultAnimation(target, rollObject, count, current) {
        if (count < 30) {
            var excludes = [];
            if (count >=29) {
                excludes.push(rollObject.result);
            }
            if (!isNaN(current) && current != excludes[0]) {
                excludes.push(current);
            }

            current = utility_getExclusionaryRoll(rollObject.sides, excludes);
            target.html(current);

            setTimeout(display_resultAnimation.bind(this, target, rollObject, count + 1, current), count * count / 5);
        } else {
            target
                .html(rollObject.result)
                .css({
                    color: '#111'
                });
        }
    }

    /**
     * Generate, store, and return a rollObject.
     *
     * @param options {object}
     * @returns {{datetime: *, result, ...}|undefined}
     */
    function data_roll(options) {
        if (!isNaN(options.sides)) {
            var result = Base.roll(options.sides);

            if (!rolls.hasOwnProperty(options.sides)) {
                rolls[options.sides] = [];
            }

            var rollObject = {
                datetime: DateFormat.format.date(new Date(), "yyyy-MM-dd HH:mm:ss"),
                result: result
            };

            if (options) {
                $.extend(rollObject, options);
            }

            rolls[options.sides].push(rollObject);

            data_save();

            return rollObject;
        }
    }

    /**
     * Save all current data.
     */
    function data_save() {
        LocalStorage.set('dice-settings', {
            animateRolls: config.animateRolls
        });
        LocalStorage.set('rolls', rolls);
    }

    /**
     * Load any saved data.
     */
    function data_load() {
        rolls = LocalStorage.get('rolls') || {};

        var settings = LocalStorage.get('dice-settings');
        if (typeof settings == 'object') {
            $.extend(config, settings);
        }
    }

    /**
     * Get a dice roll that excludes certain results. (Used for the fake rolls when animating results.)
     *
     * @param sides {number}
     * @param excludes {Array}
     * @returns {*}
     */
    function utility_getExclusionaryRoll(sides, excludes) {
        if (excludes.length >= sides) {
            excludes.splice(sides - 1);
        }

        var result = Base.roll(sides);

        if (excludes.indexOf(result) > -1) {
            return utility_getExclusionaryRoll(sides, excludes);
        } else {
            return result;
        }
    }

    data_load();
};
