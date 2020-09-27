window.Dice = new function () {
    // *********************** //
    // ***** DEFINITIONS ***** //
    // *********************** //

    /**
     * @typedef {Object} DiceRollRequest A set of options representing what should be rolled.
     * @property {number} sides  How many sides each die should have.
     * @property {number} [dice] A count of how many dice to roll.
     *
     * Options specific to characters:
     * @property {number} [character] The numeric character ID.
     * @property {string} [stat]      The string ID of the rolled stat.
     * @property {string} [system]    The string ID of what game system the character is using.
     */

    /**
     * @typedef {DiceRollRequest} DiceRollResult The result of a roll. Includes all options from the roll request.
     * @property {string}   datetime The time of the roll in "yyyy-MM-dd HH:mm:ss" format.
     * @property {number}   result   The sum of all dice rolls.
     * @property {number[]} rolls    The individual dice rolls.
     */

    // ********************* //
    // ***** CONSTANTS ***** //
    // ********************* //

    const config = {
        animateRolls: true,
        dice: ['d', 4, 6, 8, 10, 12, 20, 100],
        rollAnimationCount: 20,
        rollAnimationRate: 4,
    };

    // ********************* //
    // ***** VARIABLES ***** //
    // ********************* //

    /** @type {Object} References to various DOM elements. */
    const elements = {};

    let rolls = null;

    // ********************* //
    // ***** FUNCTIONS ***** //
    // ********************* //

    // ------ //
    // PUBLIC //
    // ------ //

    /**
     * Get the result of a roll without effecting the DOM.
     *
     * @param {DiceRollRequest} options
     * @returns {DiceRollResult}
     */
    this.roll = function (options) {
        return data_roll(options);
    };

    this.clearRolls = function (callback) {
        if (rolls && !$.isEmptyObject(rolls)) {
            if (confirm('Clear ALL roll data? This is PERMANENT!')) {
                rolls = {};
                data_save();
                if (typeof callback === 'function') {
                    callback('clear-rolls');
                }
                return;
            }
        }

        if (typeof callback === 'function') {
            callback('clear-rolls');
        }
    };

    /**
     * Fill the target element with dice controls.
     *
     * @param {jQuery}   target     The element to be emptied and filled.
     * @param {function} [callback] Function to call when options are changed. Passed the changed option's string ID.
     */
    this.displayControls = function (target, callback) {
        target.empty();

        if (!target.hasClass('dice-controls')) {
            target.addClass('dice-controls');
        }

        elements.controls = target;

        elements.animateControl = Utility.addElement('dice-controls-animate', elements.controls, {
            element: 'a',
            text: 'Animation',
            click: function () {
                config.animateRolls = !config.animateRolls;
                data_save();
                if (typeof callback === 'function') {
                    callback('roll-animation');
                }
            },
            mousedown: Utility.returnFalse,
        });
        Utility.addElement(null, elements.animateControl, {
            element: 'i',
            prepend: true,
            'class': 'fa fa-fw fa-' + (config.animateRolls ? 'check-square-o' : 'square-o'),
        });

        elements.clearControl = Utility.addElement('dice-controls-clear', elements.controls, {
            element: 'a',
            text: 'Clear',
            click: Dice.clearRolls.bind(this, callback),
            mousedown: Utility.returnFalse,
        });
        Utility.addElement(null, elements.clearControl, {
            element: 'i',
            prepend: true,
            'class': 'fa fa-fw fa-times',
        });
    };

    /**
     * Append a die roll button to the target.
     *
     * @param {jQuery}        target
     * @param {number|string} sides
     * @param {function}      callback Called when the button is clicked.
     */
    this.appendDie = function (target, sides, callback) {
        if (sides === 'd') {
            return Utility.addElement('dice-die custom', target, {
                element: 'input',
                type: 'text',
                placeholder: 'custom',
                title: 'Type a value like 3d6 and press Enter',
                keydown: (function (callback, sides, event) {
                    if (event && event.keyCode === 13) {
                        callback(sides);
                        return false;
                    }
                }).bind(null, callback, sides),
            });
        }

        return Utility.addElement('dice-die', target, {
            element: 'a',
            href: 'javascript:;',
            text: sides,
            click: callback.bind(null, sides),
        });
    };

    /**
     * Append a die result, and roll it if necessary.
     *
     * @param {jQuery}         target
     * @param {DiceRollResult} rollResult          If the "result" property is not found this is passed to data_roll.
     * @param {boolean}        [suppressAnimation] Whether to prevent animation of the property when it's added.
     */
    this.appendResult = function (target, rollResult, suppressAnimation) {
        if (typeof rollResult.result !== 'number') {
            return;
            // TODO: This should replace the roll instead of creating a new one! Currently this method is not called
            // TODO: without the result property.
            // rollResult = data_roll(rollResult);
        }

        let animate = !suppressAnimation && config.animateRolls;
        let die = Utility.addElement('dice-die-result', target, {
            prepend: true,
            css: animate ? {} : {color: '#111'},
        });
        if (rollResult.dice && rollResult.dice > 1) {
            die.attr('title', rollResult.sides + 'd' + rollResult.dice);
        }
        die
            .mouseenter((function (rollObject) {
                if (rollObject.stat) {
                    let systemConfig = System.getConfig(rollObject.system);
                    let systemClass = System.getClass(rollObject.system);
                    let stat = systemClass.getStat(rollObject.stat);
                    let characterName = Character.getName(rollObject.character);

                    Utility.addElement('dice-die-result-stat', this, {
                        text: stat.name,
                        title: characterName + ' - ' + systemConfig.name,
                    });
                }

                Utility.addElement('dice-die-result-timestamp', this, {
                    text: DateFormat.format.prettyDate(rollObject.datetime + '.000'),
                    title: rollObject.datetime,
                });
            }).bind(die, rollResult))
            .mouseleave(function () {
                $('.dice-die-result-stat, .dice-die-result-timestamp', this).remove();
            });

        if (animate) {
            display_resultAnimation(die, rollResult, 0);
        } else {
            die.text(rollResult.result);
        }
    };

    /**
     * Get the current setting for animating rolls.
     *
     * @returns {boolean}
     */
    this.getAnimation = function () {
        return config.animateRolls;
    };

    /**
     * Set the current setting for animating rolls.
     *
     * @returns {boolean}
     */
    this.setAnimation = function (value) {
        config.animateRolls = value;
    };

    /**
     * Get all rolls or all rolls of a particular number of sides.
     *
     * @param {number|DiceRollRequest|DiceRollResult} [filters] If a number, returns all rolls with that side count.
     * @returns {DiceRollResult[]|Object.<string|number, DiceRollResult>} When filtered, returns a list of rolls.
     *                                                                    Otherwise, returns the complete roll object.
     */
    this.getRolls = function (filters) {
        switch (typeof filters) {
            case 'number':
                return rolls && rolls[filters] || [];
            case 'object':
                let initialRolls = $.extend(true, [], rolls && rolls[filters.sides] || []);
                let filteredRolls = [];
                // noinspection JSAssignmentUsedAsCondition
                for (let i = 0, roll; roll = initialRolls[i]; i++) {
                    let keeper = true;
                    for (let key in filters) {
                        if (filters.hasOwnProperty(key) && roll[key] !== filters[key]) {
                            keeper = false;
                            break;
                        }
                    }
                    if (keeper) {
                        filteredRolls.push(roll);
                    }
                }
                return filteredRolls;
            default:
                return rolls || {};
        }
    };

    // ------- //
    // PRIVATE //
    // ------- //

    /**
     * Handle the animation of showing a roll result.
     *
     * @param {jQuery}         target
     * @param {DiceRollResult} rollResult
     * @param {number}         count      How many times this function has looped.
     * @param {number}         [current]  The currently displayed teaser result.
     */
    function display_resultAnimation(target, rollResult, count, current) {
        if (count < config.rollAnimationCount) {
            let excludes = [];
            if (count >= config.rollAnimationCount - 1) {
                excludes.push(rollResult.result);
            }
            if (!isNaN(current) && current !== excludes[0]) {
                excludes.push(current);
            }

            current = utility_getExclusionaryRoll(rollResult.sides, excludes);
            target.html(current);

            setTimeout(
                display_resultAnimation.bind(this, target, rollResult, count + 1, current),
                count * count / config.rollAnimationRate
            );
        } else {
            target
                .html(rollResult.result)
                .css({color: '#111'});
        }
    }

    /**
     * Generate, store, and return a rollObject.
     *
     * @param {DiceRollRequest} options
     * @returns {DiceRollResult}
     */
    function data_roll(options) {
        if (!options.dice) {
            options.dice = 1;
        }

        let rollObject = $.extend(true, {}, options);
        rollObject.datetime = DateFormat.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss');
        rollObject.result = 0;
        rollObject.rolls = [];

        if (isNaN(options.sides)) {
            return options;
        }

        for (let roll = 1; roll <= options.dice; roll++) {
            let rollResult = Utility.roll(options.sides);
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
            animateRolls: config.animateRolls,
        });
        LocalStorage.set('rolls', rolls);
    }

    /**
     * Load any saved data.
     */
    function data_load() {
        rolls = LocalStorage.get('rolls') || {};

        let settings = LocalStorage.get('dice-settings');
        if (typeof settings === 'object') {
            $.extend(config, settings);
        }
    }

    /**
     * Get a dice roll that excludes certain results. (Used for the fake rolls when animating results.)
     *
     * @param {number}   sides
     * @param {number[]} excludes A list of numbers to not allow as a result.
     * @returns {*}
     */
    function utility_getExclusionaryRoll(sides, excludes) {
        // If we're somehow told to roll between 1 and 1, don't try to exclude anything or this will loop forever.
        if (sides === 1) {
            return 1;
        }

        if (excludes.length >= sides) {
            excludes.splice(sides - 1);
        }

        let result = Utility.roll(sides);

        if (excludes.indexOf(result) > -1) {
            return utility_getExclusionaryRoll(sides, excludes);
        } else {
            return result;
        }
    }

    // ************************** //
    // ***** INITIALIZATION ***** //
    // ************************** //

    data_load();
};
