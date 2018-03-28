var Dice = new function() {
    var config = {
        animateRolls: true,
        dice: [ 'd', 4, 6, 8, 10, 12, 20, 100 ],
        rollAnimationCount: 20,
        rollAnimationRate: 4,
    };
    var elements = {};
    var rolls = null;

    /**
     * Get the result of a roll without effecting the DOM.
     *
     * @param options
     * @returns {object}
     */
    this.roll = function (options) {
        return data_roll(options);
    };

    this.clearRolls = function(callback) {
        if (rolls && !$.isEmptyObject(rolls)) {
            if (confirm('Clear ALL roll data? This is PERMANENT!')) {
                rolls = {};
                data_save();
                if (typeof callback == 'function') {
                    callback('clear-rolls');
                }
                return;
            }
        }

        if (typeof callback == 'function') {
            callback('clear-rolls');
        }
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

        elements.animateControl = Utility.addElement('dice-controls-animate', elements.controls, {
            element: 'a',
            text: 'Animation',
            click: function() {
                config.animateRolls = !config.animateRolls;
                data_save();
                if (typeof callback == 'function') {
                    callback('roll-animation');
                }
            },
            mousedown: Utility.returnFalse
        });
        Utility.addElement(null, elements.animateControl, {
            element: 'i',
            prepend: true,
            'class': 'fa fa-fw fa-' + (config.animateRolls ? 'check-square-o' : 'square-o')
        });

        elements.clearControl = Utility.addElement('dice-controls-clear', elements.controls, {
            element: 'a',
            text: 'Clear',
            click: Dice.clearRolls.bind(this, callback),
            mousedown: Utility.returnFalse
        });
        Utility.addElement(null, elements.clearControl, {
            element: 'i',
            prepend: true,
            'class': 'fa fa-fw fa-times'
        });
    };

    /**
     * Append a die roll button to the target.
     *
     * @param target {jQuery}
     * @param sides {number|string}
     * @param callback {function} Called when the button is clicked.
     */
    this.appendDie = function(target, sides, callback) {
        if (sides === 'd') {
            return Utility.addElement('dice-die custom', target, {
                element: 'input',
                type: 'text',
                placeholder: 'custom',
                title: 'Type a value like 3d6 and press Enter',
                keydown: (function(callback, sides, event) {
                    if (event && event.keyCode === 13) {
                        callback(sides);
                        return false;
                    }
                }).bind(null, callback, sides)
            });
        }

        return Utility.addElement('dice-die', target, {
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
            // rollObjectOrOptions = data_roll(rollObjectOrOptions); // TODO: This should replace the roll instead of creating a new one! Currently this method is not called without the result property.
        }

        var animate = !suppressAnimation && config.animateRolls;
        var die = Utility.addElement('dice-die-result', target, {
            prepend: true,
            css: animate ? {} : { color: '#111' }
        });
        if (rollObjectOrOptions.dice && rollObjectOrOptions.dice > 1) {
            die.attr('title', rollObjectOrOptions.sides + 'd' + rollObjectOrOptions.dice);
        }
        die
            .mouseenter((function (rollObject) {
                if (rollObject.stat) {
                    var systemConfig = System.getConfig(rollObject.system);
                    var systemClass = System.getClass(rollObject.system);
                    var stat = systemClass.getStat(rollObject.stat);
                    var characterName = Character.getName(rollObject.character);

                    Utility.addElement('dice-die-result-stat', this, {
                        text: stat.name,
                        title: characterName + ' - ' + systemConfig.name
                    });
                }

                Utility.addElement('dice-die-result-timestamp', this, {
                    text: DateFormat.format.prettyDate(rollObject.datetime + '.000'),
                    title: rollObject.datetime
                });
            }).bind(die, rollObjectOrOptions))
            .mouseleave(function () {
                $('.dice-die-result-stat, .dice-die-result-timestamp', this).remove();
            });

        if (animate) {
            display_resultAnimation(die, rollObjectOrOptions, 0);
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
     * @param [filters] {number|object} If it's a number it'll return all rolls with that number of sides. Object filters MUST include a "sides" filter.
     * @returns {*}
     */
    this.getRolls = function (filters) {
        switch (typeof filters) {
            case 'number':
                return rolls && rolls[filters] || [];
                break;
            case 'object':
                var initialRolls = $.extend(true, [], rolls && rolls[filters.sides] || []);
                var filteredRolls = [];
                for (var i = 0, roll; roll = initialRolls[i]; i++) {
                    var keeper = true;
                    for (var key in filters) {
                        if (filters.hasOwnProperty(key) && roll[key] != filters[key]) {
                            keeper = false;
                        }
                    }
                    if (keeper) {
                        filteredRolls.push(roll);
                    }
                }
                return filteredRolls;
                break;
            default:
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
        if (count < config.rollAnimationCount) {
            var excludes = [];
            if (count >= config.rollAnimationCount - 1) {
                excludes.push(rollObject.result);
            }
            if (!isNaN(current) && current != excludes[0]) {
                excludes.push(current);
            }

            current = utility_getExclusionaryRoll(rollObject.sides, excludes);
            target.html(current);

            setTimeout(display_resultAnimation.bind(this, target, rollObject, count + 1, current), count * count / config.rollAnimationRate);
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
     * @returns {object}
     */
    function data_roll(options) {
        if (!options.dice) {
            options.dice = 1;
        }

        var rollObject = $.extend(true, {}, options);
        rollObject.datetime = DateFormat.format.date(new Date(), "yyyy-MM-dd HH:mm:ss");
        rollObject.result = 0;
        rollObject.rolls = [];

        if (isNaN(options.sides)) {
            return options;
        }

        for (var roll = 1; roll <= options.dice; roll++) {
            var rollResult = Utility.roll(options.sides);
            rollObject.rolls.push(rollResult);
            rollObject.result += rollResult;
        }

        if (!rolls.hasOwnProperty(options.sides)) {
            rolls[options.sides] = [];
        }

        rolls[options.sides].push(rollObject);

        data_save();

        return rollObject;
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

        var result = Utility.roll(sides);

        if (excludes.indexOf(result) > -1) {
            return utility_getExclusionaryRoll(sides, excludes);
        } else {
            return result;
        }
    }

    data_load();
};
