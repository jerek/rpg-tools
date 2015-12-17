var Page_Dice = new function() {
    var config = {
        animateRolls: true,
        dice: [ 'd', 4, 6, 8, 10, 12, 20, 100 ]
    };
    var elements = {};
    var rolls = {};

    this.init = function(target) {
        elements.container = target;

        display_body();
    };

    function display_body() {
        elements.diceWrapper = Base.addElement('dice-wrapper', elements.container);
        elements.dice = Base.addElement('dice', elements.diceWrapper);
        display_dice(elements.dice);

        rolls = LocalStorage.get('rolls') || {};

        if (!$.isEmptyObject(rolls)) {
            for (var die in rolls) {
                if (rolls.hasOwnProperty(die) && rolls[die].length) {
                    for (var i = 0, rollObject; rollObject = rolls[die][i]; i++) {
                        display_result(die, rollObject, true);
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
            var dieButton = Base.addElement('dice-die', wrapper, {
                element: 'a',
                href: 'javascript:;',
                text: die,
                click: action_roll.bind(null, die)
            });
            var log = Base.addElement('dice-die-log', wrapper);

            elements.dice[die] = {
                wrapper: wrapper,
                die: dieButton,
                log: log
            };
        }

        target.attr('data-dice-count', config.dice.length);
    }

    function display_result(sides, rollObject, doNotAnimate) {
        if (elements.dice[sides] && elements.dice[sides].log) {
            var animate = !doNotAnimate && config.animateRolls;
            var css = animate ?
                { opacity: '0' } :
                { color: '#111' };
            var die = Base.addElement('dice-die-result', elements.dice[sides].log, {
                prepend: true,
                css: css,
                title: rollObject.datetime
            });

            if (animate) {
                display_resultAnimation(sides, die, rollObject.result, 0);

                setTimeout(function () {
                    die.css({opacity: ''});
                }, 1);
            } else {
                die.html(rollObject.result);
            }
        }
    }

    function display_resultAnimation(sides, target, result, count, current) {
        if (count < 30) {
            var excludes = [];
            if (count >=29) {
                excludes.push(result);
            }
            if (!isNaN(current) && current != excludes[0]) {
                excludes.push(current);
            }

            current = utility_getExclusionaryRoll(sides, excludes);
            target.html(current);

            setTimeout(display_resultAnimation.bind(this, sides, target, result, count + 1, current), count * count / 5);
        } else {
            target
                .html(result)
                .css({
                    color: '#111'
                });
        }
    }

    function action_roll(sides) {
        if (!isNaN(sides)) {
            var result = Base.roll(sides);

            if (!rolls.hasOwnProperty(sides)) {
                rolls[sides] = [];
            }

            var rollObject = {
                datetime: DateFormat.format.date(new Date(), "yyyy-MM-dd HH:mm:ss"),
                result: result
            };

            rolls[sides].push(rollObject);

            LocalStorage.set('rolls', rolls);

            display_result(sides, rollObject);
        } else {
            // TODO: multi-side options
        }
    }

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
};
