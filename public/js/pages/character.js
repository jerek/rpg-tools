var Page_Character = new function() {
    var config = {
        stats: {},
        system: 'deciv'
    };
    var elements = {
        attributes: {}
    };

    this.init = function(target) {
        elements.container = target;

        data_load();

        display_controls();
        display_body();
    };

    function utility_getSystemClass() {
        return Base.getSystemClass(config.system);
    }

    function display_controls() {
        if (elements.controls) {
            elements.controls.remove && elements.controls.remove();
        }

        elements.controls = Base.addElement('character-controls', elements.container);

        elements.setStatsControl = Base.addElement('character-controls-set-stats', elements.controls, {
            element: 'a',
            text: 'Set All Stats',
            click: action_setStats,
            mousedown: Base.returnFalse
        });
        Base.addElement(null, elements.setStatsControl, {
            element: 'i',
            prepend: true,
            'class': 'fa fa-fw fa-pencil-square-o'
        });

        elements.clearControl = Base.addElement('character-controls-clear', elements.controls, {
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

        var allAttributes = systemClass.getAllAttributes();
        for (var i = 0, attributeSet; attributeSet = allAttributes[i]; i++) {
            if (i > 0) {
                var emptyRow = Base.addElement('character-attribute', elements.characterAttributes);
                Base.addElement(null, emptyRow);
            }

            for (var j = 0, attribute; attribute = attributeSet[j]; j++) {
                display_attribute(elements.characterAttributes, attribute);
            }
        }
    }

    function display_attribute(target, attribute) {
        elements.attributes[attribute.id] = Base.addElement('character-attribute', target);

        var name = Base.addElement('character-attribute-name', elements.attributes[attribute.id], {
            text: attribute.name,
            click: action_roll.bind(elements.attributes[attribute.id], attribute),
            mousedown: Base.returnFalse
        });

        if (attribute.secondary) {
            name.addClass('secondary');
        }

        if (!config.stats.hasOwnProperty(attribute.id)) {
            config.stats[attribute.id] = 10;
        }

        var stat = Base.addElement('character-attribute-stat', elements.attributes[attribute.id], {
            text: config.stats[attribute.id],
            click: action_setStat.bind(null, attribute.id)
        });

        var log = Base.addElement('character-attribute-log', elements.attributes[attribute.id]);

        var logInner = Base.addElement('character-attribute-log-inner', log);

        var logTogglerBg = Base.addElement('character-attribute-log-toggler-background', log);

        var logToggler = Base.addElement('character-attribute-log-toggler fa fa-plus', log, {
            element: 'a',
            click: action_toggleLog.bind(elements.attributes[attribute.id], attribute),
            mousedown: Base.returnFalse
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

    function action_roll(attribute) {
        var rollObject = Dice.roll({
            sides: attribute.die,
            stat: attribute.id,
            system: config.system
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

    function action_setStats() {
        var systemClass = utility_getSystemClass();

        var stats = systemClass.getAllAttributes();

        for (var i = 0, statGroup; statGroup = stats[i]; i++) {
            for (var j = 0, stat; stat = statGroup[j]; j++) {
                var value = prompt('Set ' + stat.name + ' to:', config.stats[stat.id]);
                if (value) {
                    data_setStat(stat.id, value);
                } else {
                    return;
                }
            }
        }
    }

    function action_setStat(stat) {
        var value = prompt('Set ' + stat + ' to:', config.stats[stat]);
        if (value) {
            data_setStat(stat, value);
        }
    }

    function data_setStat(stat, value) {
        config.stats[stat] = value;
        data_save();
        $('.character-attribute-stat', elements.attributes[stat]).html(value);
    }

    function data_save() {
        LocalStorage.set('character', {
            stats: config.stats
        });
    }

    function data_load() {
        var character = LocalStorage.get('character');
        if (character && character.stats) {
            config.stats = character.stats;
        }
    }
};
