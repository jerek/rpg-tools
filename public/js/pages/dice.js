window.Page_Dice = new function () {
    const Dice = window.Dice;
    const Utility = window.Utility;

    // ********************* //
    // ***** VARIABLES ***** //
    // ********************* //

    /** @type {Object} References to various DOM elements. */
    const elements = {};

    // ********************* //
    // ***** FUNCTIONS ***** //
    // ********************* //

    // ------ //
    // PUBLIC //
    // ------ //

    this.init = function (target) {
        elements.container = target;

        display_controls();
        display_body();
    };

    // ------- //
    // PRIVATE //
    // ------- //

    function display_controls() {
        elements.controls && elements.controls.remove && elements.controls.remove();

        elements.controls = Utility.addElement('dice-controls', elements.container);

        Dice.displayControls(elements.controls, Page_Dice.init.bind(null, elements.container));
    }

    function display_body() {
        elements.dice && elements.dice.remove && elements.dice.remove();
        elements.diceWrapper && elements.diceWrapper.remove && elements.diceWrapper.remove();

        elements.diceWrapper = Utility.addElement('dice-wrapper', elements.container);
        elements.dice = Utility.addElement('dice', elements.diceWrapper);
        display_dice(elements.dice);

        let rolls = Dice.getRolls();
        if (!$.isEmptyObject(rolls)) {
            let groupedRolls = {};
            for (let die in rolls) {
                if (rolls.hasOwnProperty(die) && rolls[die].length) {
                    // noinspection JSAssignmentUsedAsCondition
                    for (let i = 0, rollResult; rollResult = rolls[die][i]; i++) {
                        let column = rollResult.dice && rollResult.dice > 1 ? Dice.DIE_CUSTOM : rollResult.sides;

                        if (!groupedRolls[column]) {
                            groupedRolls[column] = [];
                        }

                        groupedRolls[column].push(rollResult);
                    }
                }
            }

            if (groupedRolls.d) {
                // Since the custom rolls had to be grouped from other sources they need to be sorted
                groupedRolls.d.sort(function (a, b) {
                    return new Date(a.datetime) - new Date(b.datetime);
                });
            }

            for (let die in groupedRolls) {
                if (groupedRolls.hasOwnProperty(die) && groupedRolls[die].length) {
                    // noinspection JSAssignmentUsedAsCondition
                    for (let j = 0, rollResult; rollResult = groupedRolls[die][j]; j++) {
                        display_result(rollResult, true);
                    }
                }
            }
        }
    }

    /**
     * Explain the correct dice notation in an alert.
     */
    function display_customRollExplanation() {
        alert('Enter a value like 3d6 to roll 3 dice with 6 sides,\nthen press enter.');
    }

    function display_dice(target) {
        if (elements.dice) {
            for (let oldDie in elements.dice) {
                if (elements.dice.hasOwnProperty(oldDie) && elements.dice[oldDie] instanceof jQuery) {
                    elements.dice[oldDie].wrapper.remove();
                    elements.dice[oldDie].die.remove();
                    elements.dice[oldDie].log.remove();
                }
            }
        }

        elements.dice = {};
        let dice = Dice.getDice();
        // noinspection JSAssignmentUsedAsCondition
        for (let i = 0, die; die = dice[i]; i++) {
            let wrapper = Utility.addElement('dice-die-wrapper', target, {
                'data-die': die.id,
            });
            let dieButton = Dice.appendDieButton(wrapper, die, action_roll);
            let log = Utility.addElement('dice-die-log', wrapper);

            elements.dice[die.id] = {
                wrapper: wrapper,
                die: dieButton,
                log: log,
            };
        }

        target.attr('data-dice-count', dice.length);
    }

    /**
     * Display the given roll result on the page.
     *
     * @param {DiceRollResult} rollResult
     * @param {boolean}        [suppressAnimation] Whether this display instance should never animate.
     */
    function display_result(rollResult, suppressAnimation) {
        let column = Dice.getRollTypeId(rollResult);
        if (elements.dice[column] && elements.dice[column].log) {
            Dice.appendResult(elements.dice[column].log, rollResult, suppressAnimation);
        }
    }

    /**
     * Roll a die with a given number of sides. If it's the string "d" it fetches the custom value from the input box.
     *
     * @param {Die} die
     * @return {boolean} Whether it was able to make a roll.
     */
    function action_roll(die) {
        /** @type {DiceRollRequest} De-reference the die object so we can modify a new copy of it as a request. */
        let rollRequest = JSON.parse(JSON.stringify(die));

        switch (rollRequest.type) {
            case Dice.DIE_NUMERIC:
            case Dice.DIE_BODY_LOCATION:
                // These types can be rolled as-is.

                display_result(Dice.roll(rollRequest));

                return true;
            case Dice.DIE_CUSTOM:
                // Check the user's input for the custom roll, and validate it.

                let $rollsInput = $('.dice-die.custom');
                let rolls = $rollsInput.val();

                if (!rolls || typeof rolls !== 'string') {
                    display_customRollExplanation();

                    return false;
                }

                rolls = rolls.replace(/^[^\d]*(\d+d\d+)[^\d]*$/, '$1');

                if (!rolls.match(/^\d+d\d+$/)) {
                    display_customRollExplanation();

                    return false;
                }

                $rollsInput.val(rolls);

                let parts = rolls.split(Dice.DIE_CUSTOM);
                rollRequest.dice = parseInt(parts[0]);
                rollRequest.sides = parseInt(parts[1]);

                if (isNaN(rollRequest.dice) || isNaN(rollRequest.sides)) {
                    Utility.error('Error parsing custom roll request.');

                    return false;
                }

                display_result(Dice.roll(rollRequest));

                return true;
            default:
                // Invalid die type.

                Utility.error('Cannot roll die of unknown type ' + JSON.stringify(die) + '.');

                return false;
        }
    }
};
