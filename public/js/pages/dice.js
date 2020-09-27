window.Page_Dice = new function () {
    // ********************* //
    // ***** CONSTANTS ***** //
    // ********************* //

    const config = {
        dice: ['d', 4, 6, 8, 10, 12, 20, 100],
    };

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
                    for (let i = 0, rollObject; rollObject = rolls[die][i]; i++) {
                        let column = rollObject.dice && rollObject.dice > 1 ? 'd' : rollObject.sides;

                        if (!groupedRolls[column]) {
                            groupedRolls[column] = [];
                        }

                        groupedRolls[column].push(rollObject);
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
                    for (let j = 0, rollObject; rollObject = groupedRolls[die][j]; j++) {
                        display_result(rollObject, true);
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
        // noinspection JSAssignmentUsedAsCondition
        for (let i = 0, die; die = config.dice[i]; i++) {
            let wrapper = Utility.addElement('dice-die-wrapper', target, {
                'data-die': die,
            });
            let dieButton = Dice.appendDie(wrapper, die, action_roll);
            let log = Utility.addElement('dice-die-log', wrapper);

            elements.dice[die] = {
                wrapper: wrapper,
                die: dieButton,
                log: log,
            };
        }

        target.attr('data-dice-count', config.dice.length);
    }

    function display_result(rollObject, suppressAnimation) {
        let column = rollObject.dice && rollObject.dice > 1 ? 'd' : rollObject.sides;
        if (elements.dice[column] && elements.dice[column].log) {
            Dice.appendResult(elements.dice[column].log, rollObject, suppressAnimation);
        }
    }

    /**
     * Roll a die with a given number of sides. If it's the string "d" it fetches the custom value from the input box.
     *
     * @param {number|string} sides
     * @return {boolean} Whether it was able to make a roll.
     */
    function action_roll(sides) {
        let rollObject;
        if (!isNaN(sides)) {
            rollObject = Dice.roll({sides: sides});
            display_result(rollObject);
        } else if (sides === 'd') {
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

            let parts = rolls.split('d');
            let dice = parseInt(parts[0]);
            let diceSides = parseInt(parts[1]);

            if (isNaN(dice) || isNaN(diceSides)) {
                alert('Something went wrong!');
                return false;
            }

            rollObject = Dice.roll({dice: dice, sides: diceSides});
            display_result(rollObject);
        } else {
            // Invalid number of sides
            return false;
        }

        return true;
    }
};
