var Page_Character = new function() {
    var config = {
        system: 'deciv',
        systems: {
            deciv: {
                id: 'deciv',
                name: 'Deciv',
                'class': 'Deciv'
            }
        }
    };
    var elements = {};

    this.init = function(target) {
        elements.container = target;

        display_controls();
        display_body();
    };

    function utility_getSystemClass() {
        return window['System_' + config.systems[config.system]['class']];
    }

    function display_controls() {
        if (elements.controls) {
            elements.controls.remove && elements.controls.remove();
        }

        elements.controls = Base.addElement('dice-controls', elements.container);

        elements.clearControl = Base.addElement('dice-controls-clear', elements.controls, {
            element: 'a',
            text: 'Clear Rolls',
            click: Dice.clearRolls.bind(Dice, Page_Character.init.bind(null, elements.container)),
            mousedown: Base.returnFalse
        });
        Base.addElement(null, elements.clearControl, {
            element: 'i',
            prepend: true,
            'class': 'fa fa-fw fa-times'
        });
    }

    function display_body() {
        if (elements.character) {
            elements.character.remove && elements.character.remove();
        }

        elements.character = Base.addElement('character', elements.container);

        var systemClass = utility_getSystemClass();

        elements.characterAttributes = Base.addElement('character-attributes', elements.character);

        var attributes = systemClass.getAttributes();

        elements.attributes = {};
        for (var i = 0, attribute; attribute = attributes[i]; i++) {
            elements.attributes[attribute.id] = Base.addElement('character-attribute', elements.characterAttributes);

            var name = Base.addElement('character-attribute-name', elements.attributes[attribute.id], {
                text: attribute.name,
                click: action_roll.bind(elements.attributes[attribute.id], attribute),
                mousedown: Base.returnFalse
            });

            if (attribute.secondary) {
                name.addClass('secondary');
            }

            var stat = Base.addElement('character-attribute-stat', elements.attributes[attribute.id], {
                text: 10
            });

            var log = Base.addElement('character-attribute-log', elements.attributes[attribute.id]);

            var logInner = Base.addElement('character-attribute-log-inner', log);

            var rolls = Dice.getRolls({ system: 'deciv', stat: attribute.id, sides: attribute.die });

            if (rolls && rolls.length) {
                for (var j = 0, roll; roll = rolls[j]; j++) {
                    Dice.appendResult(logInner, roll, true);
                }
            }
        }

        var emptyRow = Base.addElement('character-attribute', elements.characterAttributes);
        Base.addElement(null, emptyRow);

        var technicalAttributes = systemClass.getTechnicalAttributes();

        elements.attributes = {};
        for (var k = 0, technicalAttribute; technicalAttribute = technicalAttributes[k]; k++) {
            elements.attributes[technicalAttribute.id] = Base.addElement('character-attribute', elements.characterAttributes);

            var tName = Base.addElement('character-attribute-name', elements.attributes[technicalAttribute.id], {
                text: technicalAttribute.name,
                click: action_roll.bind(elements.attributes[technicalAttribute.id], technicalAttribute),
                mousedown: Base.returnFalse
            });

            var tStat = Base.addElement('character-attribute-stat', elements.attributes[technicalAttribute.id], {
                text: 10
            });

            var tLog = Base.addElement('character-attribute-log', elements.attributes[technicalAttribute.id]);

            var tLogInner = Base.addElement('character-attribute-log-inner', tLog);

            var tRolls = Dice.getRolls({ system: 'deciv', stat: technicalAttribute.id, sides: technicalAttribute.die });

            if (tRolls && tRolls.length) {
                for (var l = 0, tRoll; tRoll = tRolls[l]; l++) {
                    Dice.appendResult(tLogInner, tRoll, true);
                }
            }
        }
    }

    function display_result(target, rollObject, suppressAnimation) {
        Dice.appendResult(target, rollObject, suppressAnimation);
    }

    function action_roll(attribute) {
        var rollObject = Dice.roll({
            sides: attribute.die,
            stat: attribute.id,
            system: config.system
        });

        display_result($('.character-attribute-log-inner', this), rollObject);
    }
};
