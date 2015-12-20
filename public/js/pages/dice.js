var Page_Dice = new function() {
    var config = {
        dice: [ 'd', 4, 6, 8, 10, 12, 20, 100 ]
    };
    var elements = {};

    this.init = function(target) {
        elements.container = target;

        display_controls();
        display_body();
    };

    function display_controls() {
        if (elements.controls) {
            elements.controls.remove && elements.controls.remove();
        }

        elements.controls = Base.addElement('dice-controls', elements.container);

        Dice.displayControls(elements.controls, Page_Dice.init.bind(null, elements.container));
    }

    function display_body() {
        if (elements.dice && elements.diceWrapper) {
            elements.dice.remove && elements.dice.remove();
            elements.diceWrapper.remove && elements.diceWrapper.remove();
        }

        elements.diceWrapper = Base.addElement('dice-wrapper', elements.container);
        elements.dice = Base.addElement('dice', elements.diceWrapper);
        display_dice(elements.dice);

        var rolls = Dice.getRolls();
        if (!$.isEmptyObject(rolls)) {
            for (var die in rolls) {
                if (rolls.hasOwnProperty(die) && rolls[die].length) {
                    for (var i = 0, rollObject; rollObject = rolls[die][i]; i++) {
                        display_result(rollObject, true);
                    }
                }
            }
        }
    }

    function display_dice(target) {
        if (elements.dice) {
            for (var oldDie in elements.dice) {
                if (elements.dice.hasOwnProperty(oldDie) && elements.dice[oldDie] instanceof jQuery) {
                    elements.dice[oldDie].wrapper.remove();
                    elements.dice[oldDie].die.remove();
                    elements.dice[oldDie].log.remove();
                }
            }
        }

        elements.dice = {};
        for (var i = 0, die; die = config.dice[i]; i++) {
            var wrapper = Base.addElement('dice-die-wrapper', target);
            var dieButton = Dice.appendDie(wrapper, die, action_roll);
            var log = Base.addElement('dice-die-log', wrapper);

            elements.dice[die] = {
                wrapper: wrapper,
                die: dieButton,
                log: log
            };
        }

        target.attr('data-dice-count', config.dice.length);
    }

    function display_result(rollObject, suppressAnimation) {
        if (elements.dice[rollObject.sides] && elements.dice[rollObject.sides].log) {
            Dice.appendResult(elements.dice[rollObject.sides].log, rollObject, suppressAnimation);
        }
    }

    function action_roll(sides) {
        if (!isNaN(sides)) {
            var rollObject = Dice.roll({ sides: sides });

            display_result(rollObject);
        } else {
            // TODO: multi-side options
        }
    }
};
