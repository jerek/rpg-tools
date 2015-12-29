var Page_Character = new function() {
    var config = {
        character: null
    };
    var elements = {
        stats: {}
    };

    this.init = function(target) {
        elements.container = target;

        display_controls();
        display_name();
        display_body();
    };

    function display_controls() {
        elements.controls && elements.controls.remove && elements.controls.remove();

        elements.controls = Utility.addElement('character-controls', elements.container);

        elements.characterListControl = Utility.addElement('character-controls-load-character', elements.controls, {
            element: 'a',
            text: 'Characters',
            click: action_characterList,
            mousedown: Utility.returnFalse
        });
        Utility.addElement(null, elements.characterListControl, {
            element: 'i',
            prepend: true,
            'class': 'fa fa-fw fa-file-text-o'
        });

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

        /*
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
        */
    }

    function display_name() {
        elements.name && elements.name.remove && elements.name.remove();

        elements.name = Utility.addElement('character-name', elements.container, 'h1');

        if (config.character) {
            elements.name
                .text(Character.getName(config.character) || 'Unnamed Character')
                .addClass('editable')
                .click(action_setName);
        } else {
            elements.name.text('Characters');
        }
    }

    function display_body() {
        elements.character && elements.character.remove && elements.character.remove();
        elements.characterList && elements.characterList.remove && elements.characterList.remove();

        if (!config.character) {
            display_characterManagement();
            return;
        }

        elements.character = Utility.addElement('character', elements.container);

        elements.characterStats = Utility.addElement('character-stats', elements.character);

        var systemClass = System.getClass(Character.getSystem(config.character));

        if (!systemClass) {
            return;
        }

        var allStats = systemClass.getAllStats();
        for (var i = 0, statSet; statSet = allStats[i]; i++) {
            if (i > 0) {
                var emptyRow = Utility.addElement('character-stat', elements.characterStats);
                Utility.addElement(null, emptyRow);
            }

            for (var j = 0, stat; stat = statSet[j]; j++) {
                display_stat(elements.characterStats, stat);
            }
        }
    }

    function display_characterManagement() {
        elements.characterList = Utility.addElement('character-load', elements.container);

        var characters = Character.getCharacters();
        if (!characters) {
            return;
        }

        elements.charactersList = Utility.addElement('character-load-list', elements.characterList);

        var createChar = Utility.addElement('character-load-list-character character-load-list-character-create', elements.charactersList, {
            element: 'div',
            text: ' Create Character',
            click: action_createCharacter
        });
        Utility.addElement('fa fa-plus-square-o', createChar, {
            element: 'i',
            prepend: true
        });

        for (var i = 0, character; character = characters[i]; i++) {
            Utility.addElement('character-load-list-character', elements.charactersList, {
                element: 'div',
                text: character.name,
                click: action_loadCharacter.bind(null, character.id)
            });
        }
    }

    function display_stat(target, stat) {
        elements.stats[stat.id] = Utility.addElement('character-stat', target);

        var name = Utility.addElement('character-stat-name', elements.stats[stat.id], {
            text: stat.name,
            click: action_roll.bind(elements.stats[stat.id], stat),
            mousedown: Utility.returnFalse
        });

        if (stat.secondary) {
            name.addClass('secondary');
        }

        var statValue = Character.getStat(config.character, stat.id);
        var statValueDisplay = Utility.addElement('character-stat-value', elements.stats[stat.id], {
            text: typeof statValue == 'number' ? statValue : '?'
        });
        if (!stat.formula) {
            statValueDisplay.addClass('editable');
            statValueDisplay.click(action_setStat.bind(null, stat));
        }

        var log = Utility.addElement('character-stat-log', elements.stats[stat.id]);

        var logInner = Utility.addElement('character-stat-log-inner', log);

        var logTogglerBg = Utility.addElement('character-stat-log-toggler-background', log);

        var logToggler = Utility.addElement('character-stat-log-toggler fa fa-plus', log, {
            element: 'a',
            click: action_toggleLog.bind(elements.stats[stat.id], stat),
            mousedown: Utility.returnFalse
        });

        var rolls = Dice.getRolls({ system: 'deciv', character: config.character, stat: stat.id, sides: stat.die });

        if (rolls && rolls.length) {
            for (var j = 0, roll; roll = rolls[j]; j++) {
                Dice.appendResult(logInner, roll, true);
            }
        }
    }

    function display_result(target, rollObject, suppressAnimation) {
        Dice.appendResult(target, rollObject, suppressAnimation);
    }

    function updateDisplay_name() {
        elements.name.html(Character.getName(config.character));
    }

    /**
     * @param {string} statId
     * @param {number} [value]
     */
    function updateDisplay_statValue(statId, value) {
        if (!value) {
            value = Character.getStat(config.character, statId);
        }

        if (elements.stats[statId]) {
            $('.character-stat-value', elements.stats[statId]).html(typeof value == 'number' ? value : '?');
        }
    }

    function action_createCharacter() {
        var name = prompt('Character Name:');
        if (name) {
            data_setCharacter(Character.create(name, 'deciv'));
        }
    }

    function action_loadCharacter(id) {
        var character = Character.get(id);

        if (!character) {
            alert('Character with ID ' + id + ' not found!');
            return;
        }

        data_setCharacter(character.id);
    }

    function action_characterList() {
        data_unsetCharacter();
    }

    function action_roll(stat) {
        var character = Character.get(config.character);

        var rollObject = Dice.roll({
            system: character.system,
            character: character.id,
            stat: stat.id,
            sides: stat.die
        });

        display_result($('.character-stat-log-inner', this), rollObject);
    }

    function action_toggleLog(stat) {
        if (this.hasClass('expand')) {
            this.removeClass('expand');
            $('.character-stat-log-toggler', this)
                .removeClass('fa-minus')
                .addClass('fa-plus');
        } else {
            this.addClass('expand');
            $('.character-stat-log-toggler', this)
                .removeClass('fa-plus')
                .addClass('fa-minus');
        }
    }

    function action_setName() {
        var character = Character.get(config.character);

        var systemInfo = System.getInfo(character.system);

        var value = prompt('Enter your ' + systemInfo.name + ' character name:', character.name);
        if (value) {
            Character.setName(character.id, value);
            updateDisplay_name();
        }
    }

    function action_setStats() {
        var systemClass = System.getClass(Character.getSystem(config.character));
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
        var stats = Character.getStats(config.character);

        var value = prompt('Set ' + stat.name + ' to:', stats[stat.id]);
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

    function data_load() {
        var pageConfig = LocalStorage.get('page-character');
        if (pageConfig && typeof pageConfig.character == 'number') {
            config.character = pageConfig.character;
        }
        data_setCharacterDataAttribute();
    }

    function data_save() {
        var oldConfig = LocalStorage.get('page-character');
        var pageNeedsRefresh = typeof oldConfig != 'object';
        if (!pageNeedsRefresh) {
            var changes = Utility.getObjectUpdateList(oldConfig, config);
            pageNeedsRefresh = changes.length > 0;
        }

        LocalStorage.set('page-character', config);

        data_setCharacterDataAttribute();

        if (pageNeedsRefresh) {
            Page_Character.init(elements.container);
        }
    }

    function data_setCharacter(characterId) {
        config.character = characterId;
        data_save();
    }

    function data_unsetCharacter() {
        config.character = null;
        data_save();
    }

    function data_setCharacterDataAttribute() {
        $(function() {
            $(document.body).attr('data-character', config.character || 'none');
        });
    }

    function data_setStat(statId, value) {
        var updatedStats = Character.setStat(config.character, statId, value);
        for (var i = 0, updatedStat; updatedStat = updatedStats[i]; i++) {
            updateDisplay_statValue(updatedStat);
        }
    }

    data_load();
};
