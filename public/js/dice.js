window.Dice = new function () {
    const self = this;
    const Utility = window.Utility;

    // *********************** //
    // ***** DEFINITIONS ***** //
    // *********************** //

    /**
     * @typedef {Object} Die The configuration for a batch of dice. Usually refers to a single die.
     *
     * @property {string} id      A unique string ID.
     * @property {string} name    A display name for the die.
     * @property {string} type    A die type constant. E.g. Dice.DIE_CUSTOM.
     * @property {number} [sides] When a die is numeric, this is the number of sides it has.
     */

    /**
     * @typedef {Die} DiceRollRequest A set of options representing what should be rolled.
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

    // ------ //
    // PUBLIC //
    // ------ //

    // Dice types.
    this.DIE_BODY_LOCATION = 'body-location';
    this.DIE_CUSTOM = 'd';
    this.DIE_NUMERIC = 'numeric';

    // ------- //
    // PRIVATE //
    // ------- //

    const config = {
        animateRolls: true,
        rollAnimationCount: 20,
        rollAnimationRate: 4,
    };

    /** @type {Die[]} A list of supported dice. Numeric dice are dynamically handled. */
    const DICE = [
        {id: this.DIE_CUSTOM,        type: this.DIE_CUSTOM,        name: 'Custom'},
        {id: '4',                    type: this.DIE_NUMERIC,       name: '4',             sides:   4},
        {id: '6',                    type: this.DIE_NUMERIC,       name: '6',             sides:   6},
        {id: '8',                    type: this.DIE_NUMERIC,       name: '8',             sides:   8},
        {id: '10',                   type: this.DIE_NUMERIC,       name: '10',            sides:  10},
        {id: '12',                   type: this.DIE_NUMERIC,       name: '12',            sides:  12},
        {id: '20',                   type: this.DIE_NUMERIC,       name: '20',            sides:  20},
        {id: '100',                  type: this.DIE_NUMERIC,       name: '100',           sides: 100},
        {id: this.DIE_BODY_LOCATION, type: this.DIE_BODY_LOCATION, name: 'Body Location', sides: 100},
    ];

    /** @type {number} The current version number of the dice rolls data format. */
    const ROLLS_VERSION = 1;

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
     * @param {DiceRollRequest} rollRequest
     * @returns {DiceRollResult}
     */
    this.roll = function (rollRequest) {
        return data_roll(rollRequest);
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
     * @param {jQuery}   target
     * @param {Die}      die
     * @param {function} callback Called when the button is clicked.
     */
    this.appendDieButton = function (target, die, callback) {
        switch (die.type) {
            case self.DIE_NUMERIC:
            case self.DIE_BODY_LOCATION:
                return Utility.addElement('dice-die', target, {
                    element: 'a',
                    href: 'javascript:;',
                    text: die.name,
                    click: callback.bind(null, die),
                });
            case self.DIE_CUSTOM:
                return Utility.addElement('dice-die custom', target, {
                    element: 'input',
                    type: 'text',
                    placeholder: die.name,
                    title: 'Type a value like 3d6 and press Enter',
                    keydown: (function (callback, type, event) {
                        if (event && event.keyCode === 13) {
                            callback(type);
                            return false;
                        }
                    }).bind(null, callback, die),
                });
            default:
                Utility.error('Cannot create die button with type ' + JSON.stringify(die.type) + '.');
        }
    };

    /**
     * Append a die result, and roll it if necessary.
     *
     * @param {jQuery}         target
     * @param {DiceRollResult} rollResult          If the "result" property is not found this is passed to data_roll.
     * @param {boolean}        [suppressAnimation] Whether to prevent animation of the property when it's added.
     */
    this.appendResult = function (target, rollResult, suppressAnimation) {
        let animate = !suppressAnimation && config.animateRolls;
        let resultDisplay = Utility.addElement('dice-die-result', target, {
            prepend: true,
            css: animate ? {} : {color: '#111'},
        });
        resultDisplay.attr('data-str-len', ('' + rollResult.result).length);
        if ((rollResult.dice || 1) > 1 || isNaN(rollResult.result)) {
            resultDisplay.attr(
                'title',
                rollResult.dice + 'd' + self.getRollSides(rollResult) + ': ' + rollResult.rolls.join(', ')
            );
        }
        resultDisplay
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
            }).bind(resultDisplay, rollResult))
            .mouseleave(function () {
                $('.dice-die-result-stat, .dice-die-result-timestamp', this).remove();
            });

        if (animate) {
            display_resultAnimation(resultDisplay, rollResult, 0);
        } else {
            resultDisplay.text(rollResult.result);
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
     * Returns the configuration for the given die ID.
     *
     * @param {string} id
     * @return {Die}
     */
    this.getDie = function (id) {
        // noinspection JSAssignmentUsedAsCondition
        for (let i = 0, die; die = DICE[i]; i++) {
            if (die.id === id) {
                return JSON.parse(JSON.stringify(die));
            }
        }
    };

    /**
     * Returns a list of Die configurations, de-referenced to ensure they don't get accidentally modified.
     *
     * @return {Die[]}
     */
    this.getDice = function () {
        return JSON.parse(JSON.stringify(DICE));
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

    /**
     * Returns the number of sides per die in the given roll.
     *
     * @param {DiceRollResult} rollResult
     * @return {number}
     */
    this.getRollSides = function (rollResult) {
        return rollResult.sides || self.getDie(rollResult.id).sides;
    };

    /**
     * Returns the die type string ID of the given roll result.
     *
     * @param {DiceRollResult} rollResult
     * @return {string}
     */
    this.getRollTypeId = function (rollResult) {
        if (rollResult.id) {
            return rollResult.id;
        }

        if ((rollResult.dice || 1) === 1) {
            let potentialType = '' + rollResult.sides;
            if (self.getDie(potentialType)) {
                return potentialType;
            }
        }

        Utility.error('Assuming unknown roll type to be in custom column.', true);

        return self.DIE_CUSTOM;
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

            current = utility_getExclusionaryRoll(rollResult, excludes);
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
     * @param {DiceRollRequest} rollRequest
     * @returns {DiceRollResult}
     */
    function data_roll(rollRequest) {
        if (!rollRequest.dice) {
            rollRequest.dice = 1;
        }

        /** @type {DiceRollResult} */
        let rollResult = JSON.parse(JSON.stringify(rollRequest));
        rollResult.datetime = DateFormat.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss');
        rollResult.result = 0;
        rollResult.rolls = [];

        if (isNaN(rollRequest.sides)) {
            return rollRequest;
        }

        for (let roll = 1; roll <= rollRequest.dice; roll++) {
            let rollResultValue = Utility.roll(rollRequest.sides);
            rollResult.rolls.push(rollResultValue);
            rollResult.result += rollResultValue;
        }

        // Do any modifications for special dice.
        rollResult.result = getRollResultText(rollResult.id, rollResult.result);

        saveNewRoll(rollResult);

        return rollResult;
    }

    /**
     * Save all current data.
     */
    function data_save() {
        rolls.version = ROLLS_VERSION;
        LocalStorage.set('dice-settings', {animateRolls: config.animateRolls});
        LocalStorage.set('rolls', rolls);
    }

    /**
     * Load any saved data.
     */
    function data_load() {
        rolls = LocalStorage.get('rolls') || {};

        if (!rolls.version) {
            let updatedAnyRolls = false;

            // Update legacy roll format to version 1.
            for (let dieId in rolls) {
                if (rolls.hasOwnProperty(dieId) && dieId !== 'version') {
                    // noinspection JSAssignmentUsedAsCondition
                    for (let i = rolls[dieId].length - 1, rollResult; rollResult = rolls[dieId][i]; i--) {
                        let realDieId = self.getRollTypeId(rollResult);
                        if (realDieId !== dieId) {
                            // Change this roll to the correct die ID.
                            rollResult.id = realDieId;

                            // Move the roll to its new home.
                            rolls[dieId].splice(i, 1);
                            if (!rolls[realDieId]) {
                                rolls[realDieId] = [];
                            }
                            rolls[realDieId].push(rollResult);

                            updatedAnyRolls = true;
                        }
                    }
                }
            }

            if (updatedAnyRolls) {
                // Re-sort all rolls.
                for (let dieId in rolls) {
                    if (!rolls.hasOwnProperty(dieId)) {
                        continue;
                    }

                    if (!rolls[dieId].length) {
                        // We must have emptied out an old custom roll column.
                        delete rolls[dieId];

                        continue;
                    }

                    rolls[dieId].sort(function (a, b) {
                        return new Date(a.datetime) - new Date(b.datetime);
                    });
                }

                data_save();
            }
        }

        let settings = LocalStorage.get('dice-settings');
        if (typeof settings === 'object') {
            $.extend(config, settings);
        }
    }

    /**
     * Returns the result text to display for the given roll result.
     *
     * @param {string}        dieId
     * @param {string|number} result
     * @return {string|number}
     */
    function getRollResultText(dieId, result) {
        switch (dieId) {
            case self.DIE_BODY_LOCATION:
                if (dieId !== self.DIE_BODY_LOCATION) {
                    Utility.error('Tried to set a body location from an invalid roll type.');

                    return result;
                }

                let bodyLocations = window.System.getBodyLocations(window.System.DEFAULT_SYSTEM);
                // noinspection JSAssignmentUsedAsCondition
                for (let i = 0, bodyLocation; bodyLocation = bodyLocations[i]; i++) {
                    if (result >= bodyLocation.min) {
                        return bodyLocation.location;
                    }
                }

                return 'Unknown';
        }

        return result;
    }

    /**
     * Append the given roll result to the roll history, and save it in local storage.
     *
     * @param {DiceRollResult} rollResult
     */
    function saveNewRoll(rollResult) {
        let id = rollResult.id;
        if (!rolls.hasOwnProperty(id)) {
            rolls[id] = [];
        }

        // Before we store this roll by its ID, remove the extraneous information that we don't want filling up storage.
        if (rollResult.type !== self.DIE_CUSTOM) {
            delete rollResult.sides;
        }
        delete rollResult.name;
        delete rollResult.type;

        rolls[id].push(rollResult);

        data_save();
    }

    /**
     * Get a dice roll that excludes certain results. (Used for the fake rolls when animating results.)
     *
     * @param {DiceRollResult} rollResult
     * @param {number[]}       excludes A list of numbers to not allow as a result.
     * @returns {*}
     */
    function utility_getExclusionaryRoll(rollResult, excludes) {
        let sides = self.getRollSides(rollResult);
        // If we're somehow told to roll between 1 and 1, don't try to exclude anything or this will loop forever.
        if (sides === 1) {
            return 1;
        }

        if (excludes.length >= sides) {
            excludes.splice(sides - 1);
        }

        let result = getRollResultText(rollResult.id, Utility.roll(sides));

        if (excludes.indexOf(result) > -1) {
            return utility_getExclusionaryRoll(rollResult, excludes);
        } else {
            return result;
        }
    }

    // ************************** //
    // ***** INITIALIZATION ***** //
    // ************************** //

    data_load();
};
