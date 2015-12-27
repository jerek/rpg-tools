var Page_Character = new function() {
    var character = {
        id: 1,
        name: 'Unnamed Character',
        stats: {},
        system: 'deciv'
    };
    var elements = {
        attributes: {}
    };

    this.init = function(target) {
        elements.container = target;

        display_controls();
        display_name();
        display_body();
    };

    this.getName = function() {
        return character.name;
    };

    function utility_getSystemClass() {
        return Base.getSystemClass(character.system);
    }

    function display_controls() {
        if (elements.controls) {
            elements.controls.remove && elements.controls.remove();
        }

        elements.controls = Utility.addElement('character-controls', elements.container);

        elements.setStatsControl = Utility.addElement('character-controls-set-stats', elements.controls, {
            element: 'a',
            text: 'Set All Stats',
            click: action_setStats,
            mousedown: Utility.returnFalse
        });
        Utility.addElement(null, elements.setStatsControl, {
            element: 'i',
            prepend: true,
            'class': 'fa fa-fw fa-pencil-square-o'
        });

        elements.clearControl = Utility.addElement('character-controls-clear', elements.controls, {
            element: 'a',
            text: 'Clear Rolls',
            click: Dice.clearRolls.bind(Dice, Page_Character.init.bind(null, elements.container)),
            mousedown: Utility.returnFalse
        });
        Utility.addElement(null, elements.clearControl, {
            element: 'i',
            prepend: true,
            'class': 'fa fa-fw fa-times'
        });
    }

    function display_name() {
        if (elements.name) {
            elements.name.remove && elements.name.remove();
        }

        elements.name = Utility.addElement('character-name', elements.container, {
            element: 'h1',
            text: character.name || 'Unnamed Character',
            click: action_setName
        });
    }

    function display_body() {
        if (elements.character) {
            elements.character.remove && elements.character.remove();
        }

        elements.character = Utility.addElement('character', elements.container);

        var systemClass = utility_getSystemClass();

        elements.characterAttributes = Utility.addElement('character-attributes', elements.character);

        var allAttributes = systemClass.getAllStats();
        for (var i = 0, attributeSet; attributeSet = allAttributes[i]; i++) {
            if (i > 0) {
                var emptyRow = Utility.addElement('character-attribute', elements.characterAttributes);
                Utility.addElement(null, emptyRow);
            }

            for (var j = 0, attribute; attribute = attributeSet[j]; j++) {
                display_attribute(elements.characterAttributes, attribute);
            }
        }
    }

    function display_attribute(target, attribute) {
        elements.attributes[attribute.id] = Utility.addElement('character-attribute', target);

        var name = Utility.addElement('character-attribute-name', elements.attributes[attribute.id], {
            text: attribute.name,
            click: action_roll.bind(elements.attributes[attribute.id], attribute),
            mousedown: Utility.returnFalse
        });

        if (attribute.secondary) {
            name.addClass('secondary');
        }

        if (!character.stats.hasOwnProperty(attribute.id)) {
            character.stats[attribute.id] = 10;
        }

        var stat = Utility.addElement('character-attribute-stat', elements.attributes[attribute.id], {
            text: character.stats[attribute.id]
        });
        if (!attribute.formula) {
            stat.addClass('editable');
            stat.click(action_setStat.bind(null, attribute));
        }

        var log = Utility.addElement('character-attribute-log', elements.attributes[attribute.id]);

        var logInner = Utility.addElement('character-attribute-log-inner', log);

        var logTogglerBg = Utility.addElement('character-attribute-log-toggler-background', log);

        var logToggler = Utility.addElement('character-attribute-log-toggler fa fa-plus', log, {
            element: 'a',
            click: action_toggleLog.bind(elements.attributes[attribute.id], attribute),
            mousedown: Utility.returnFalse
        });

        var rolls = Dice.getRolls({ system: 'deciv', stat: attribute.id, sides: attribute.die });

        if (rolls && rolls.length) {
            for (var j = 0, roll; roll = rolls[j]; j++) {
                Dice.appendResult(logInner, roll, true);
            }
        }
    }

    function display_result(target, rollObject, suppressAnimation) {
        Dice.appendResult(target, rollObject, suppressAnimation);
    }

    function updateDisplay_statValue(statId, value) {
        if (!value) {
            value = character.stats[statId];
        }

        if (elements.attributes[statId]) {
            $('.character-attribute-stat', elements.attributes[statId]).html(value);
        }
    }

    function action_roll(attribute) {
        var rollObject = Dice.roll({
            system: character.system,
            character: character.id,
            stat: attribute.id,
            sides: attribute.die
        });

        display_result($('.character-attribute-log-inner', this), rollObject);
    }

    function action_toggleLog(attribute) {
        if (this.hasClass('expand')) {
            this.removeClass('expand');
            $('.character-attribute-log-toggler', this)
                .removeClass('fa-minus')
                .addClass('fa-plus');
        } else {
            this.addClass('expand');
            $('.character-attribute-log-toggler', this)
                .removeClass('fa-plus')
                .addClass('fa-minus');
        }
    }

    function action_setName() {
        var systemInfo = Base.getSystemInfo(character.system);

        var value = prompt('Enter your ' + systemInfo.name + ' character name:', character.name);
        if (value) {
            character.name = value;
            data_save();
            Page_Character.init(elements.container);
        }
    }

    function action_setStats() {
        var systemClass = utility_getSystemClass();
        var stats = systemClass.getAllStats();

        var result = false;
        for (var i = 0, statGroup; statGroup = stats[i]; i++) {
            for (var j = 0, stat; stat = statGroup[j]; j++) {
                if (stat.formula) {
                    continue;
                }

                while (result === false) {
                    result = action_setStat(stat);

                    if (result === null) {
                        return;
                    }
                }

                result = false;
            }
        }
    }

    function action_setStat(stat) {
        var value = prompt('Set ' + stat.name + ' to:', character.stats[stat.id]);
        if (value) {
            if (value.match(/^[0-9]+$/)) {
                data_setStat(stat.id, value);
                return true;
            } else {
                Utility.error('You must set stats to a whole number!');
                return false;
            }
        }

        return null;
    }

    function data_setStat(stat, value) {
        character.stats[stat] = value;
        data_save();
        $('.character-attribute-stat', elements.attributes[stat]).html(value);
    }

    function data_updateCalculatedStats() {
        var systemClass = utility_getSystemClass();
        var stats = systemClass.getAllStats();

        for (var i = 0, statGroup; statGroup = stats[i]; i++) {
            for (var j = 0, stat; stat = statGroup[j]; j++) {
                if (stat.formula) {
                    switch (stat.formula.type) {
                        case 'lowest':
                            var lowestStats = [];
                            for (var k = 0, lowestStat; lowestStat = stat.formula.stats[k]; k++) {
                                lowestStats.push(parseInt(character.stats[lowestStat]) || 0);
                            }
                            character.stats[stat.id] = Math.min.apply(Math, lowestStats);
                            updateDisplay_statValue(stat.id);
                            break;
                        case 'highest':
                            var highestStats = [];
                            for (var l = 0, highestStat; highestStat = stat.formula.stats[l]; l++) {
                                highestStats.push(parseInt(character.stats[highestStat]) || 0);
                            }
                            character.stats[stat.id] = Math.max.apply(Math, highestStats);
                            updateDisplay_statValue(stat.id);
                            break;
                        case 'average':
                            // TODO
                        default:
                            alert('Unknown formula type!\nType: ' + stat.formula.type);
                    }
                }
            }
        }
    }

    function data_save() {
        data_updateCalculatedStats();

        LocalStorage.set('character', character);
    }

    function data_load() {
        var characterData = LocalStorage.get('character');
        if (characterData) {
            for (var property in character) {
                if (character.hasOwnProperty(property) && characterData.hasOwnProperty(property)) {
                    character[property] = characterData[property];
                }
            }
        }
    }

    data_load();
};
