window.Page_Character = new function () {
    // ********************* //
    // ***** CONSTANTS ***** //
    // ********************* //

    const config = {
        character: null,
    };

    // ********************* //
    // ***** VARIABLES ***** //
    // ********************* //

    /** @type {Object} References to various DOM elements. */
    const elements = {
        stats: {},
    };

    // ********************* //
    // ***** FUNCTIONS ***** //
    // ********************* //

    // ------ //
    // PUBLIC //
    // ------ //

    this.init = function (target) {
        elements.container = target;

        display_controls();
        display_name();
        display_body();
    };

    // ------- //
    // PRIVATE //
    // ------- //

    function display_controls() {
        elements.controls && elements.controls.remove && elements.controls.remove();

        elements.controls = Utility.addElement('character-controls', elements.container);

        elements.characterListControl = Utility.addElement('character-controls-characters', elements.controls, {
            element: 'a',
            text: 'Characters',
            click: action_characterList,
            mousedown: Utility.returnFalse,
        });
        Utility.addElement(null, elements.characterListControl, {
            element: 'i',
            prepend: true,
            'class': 'fa fa-fw fa-file-text-o',
        });

        elements.setStatsControl = Utility.addElement('character-controls-set-stats', elements.controls, {
            element: 'a',
            text: 'Set All Stats',
            click: action_setStats,
            mousedown: Utility.returnFalse,
        });
        Utility.addElement(null, elements.setStatsControl, {
            element: 'i',
            prepend: true,
            'class': 'fa fa-fw fa-pencil-square-o',
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
                .text(Character.getName(config.character))
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

        let systemClass = System.getClass(Character.getSystem(config.character));

        if (!systemClass) {
            return;
        }

        let allStats = systemClass.getAllStats();
        // noinspection JSAssignmentUsedAsCondition
        for (let i = 0, statSet; statSet = allStats[i]; i++) {
            if (i > 0) {
                let emptyRow = Utility.addElement('character-stat', elements.characterStats);
                Utility.addElement(null, emptyRow);
            }

            // noinspection JSAssignmentUsedAsCondition
            for (let j = 0, stat; stat = statSet[j]; j++) {
                display_stat(elements.characterStats, stat);
            }
        }
    }

    function display_characterManagement() {
        elements.characterList = Utility.addElement('character-list', elements.container);

        let characters = Character.getCharacters();
        if (!characters) {
            return;
        }

        elements.charactersList = Utility.addElement('character-list-characters', elements.characterList);

        let charWrapper = Utility.addElement(
            'character-list-characters-character character-list-characters-character-create',
            elements.characterList
        );

        let createChar = Utility.addElement('character-list-characters-character-name', charWrapper, {
            element: 'a',
            text: ' Create Character',
            click: action_createCharacter,
        });
        Utility.addElement('fa fa-plus-square-o', createChar, {
            element: 'i',
            prepend: true,
        });

        // noinspection JSAssignmentUsedAsCondition
        for (let i = 0, character; character = characters[i]; i++) {
            charWrapper = Utility.addElement('character-list-characters-character', elements.characterList);

            let deleteLink = Utility.addElement('character-list-characters-character-delete', charWrapper, {
                element: 'a',
                text: ' Delete',
                click: action_deleteCharacter.bind(null, character.id),
            });
            Utility.addElement('fa fa-times', deleteLink, {
                element: 'i',
                prepend: true,
            });

            Utility.addElement('character-list-characters-character-name', charWrapper, {
                element: 'a',
                text: character.name,
                click: action_loadCharacter.bind(null, character.id),
            });
        }
    }

    function display_stat(target, stat) {
        elements.stats[stat.id] = Utility.addElement('character-stat', target);

        let name = Utility.addElement('character-stat-name', elements.stats[stat.id], {
            text: stat.name,
            click: action_roll.bind(elements.stats[stat.id], stat),
            mousedown: Utility.returnFalse,
        });

        if (stat.secondary) {
            name.addClass('secondary');
        }

        let statValue = Character.getStat(config.character, stat.id);
        let statValueDisplay = Utility.addElement('character-stat-value', elements.stats[stat.id], {
            text: typeof statValue === 'number' ? statValue : '?',
        });
        if (!stat.formula) {
            statValueDisplay.addClass('editable');
            statValueDisplay.click(action_setStat.bind(null, stat));
        }
        if (typeof statValue !== 'number') {
            statValueDisplay.addClass('unknown');
        }

        let log = Utility.addElement('character-stat-log', elements.stats[stat.id]);

        let logInner = Utility.addElement('character-stat-log-inner', log);

        Utility.addElement('character-stat-log-toggler-background', log);

        Utility.addElement('character-stat-log-toggler fa fa-plus', log, {
            element: 'a',
            click: action_toggleLog.bind(elements.stats[stat.id]),
            mousedown: Utility.returnFalse,
        });

        let rolls = Dice.getRolls({system: 'deciv', character: config.character, stat: stat.id, sides: stat.die});

        if (rolls && rolls.length) {
            // noinspection JSAssignmentUsedAsCondition
            for (let j = 0, roll; roll = rolls[j]; j++) {
                Dice.appendResult(logInner, roll, true);
            }
        }
    }

    /**
     *
     * @param {jQuery|HTMLElement} target
     * @param {DiceRollResult}     rollResult
     * @param {boolean}            [suppressAnimation] Whether this display instance should never animate.
     */
    function display_result(target, rollResult, suppressAnimation) {
        Dice.appendResult(target, rollResult, suppressAnimation);
    }

    function updateDisplay_refreshPage() {
        Page_Character.init(elements.container);
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
            if (typeof value === 'number') {
                $('.character-stat-value', elements.stats[statId]).html(value).removeClass('unknown');
            } else {
                $('.character-stat-value', elements.stats[statId]).html('?');
            }
        }
    }

    function action_createCharacter() {
        let name = prompt('Character Name:');
        if (name) {
            data_setCharacter(Character.create(name, 'deciv'));
        }
    }

    function action_deleteCharacter(id) {
        let character = Character.get(id);

        if (!character) {
            alert('Character with ID ' + id + ' not found!');
            return;
        }

        if (Character.delete(id)) {
            updateDisplay_refreshPage();
        }
    }

    function action_loadCharacter(id) {
        let character = Character.get(id);

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
        let character = Character.get(config.character);

        let rollResult = Dice.roll({
            system: character.system,
            character: character.id,
            stat: stat.id,
            sides: stat.die,
        });

        display_result($('.character-stat-log-inner', this), rollResult);
    }

    function action_toggleLog() {
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
        let character = Character.get(config.character);

        let systemConfig = System.getConfig(character.system);

        let value = prompt('Enter your ' + systemConfig.name + ' character name:', character.name);
        if (value) {
            Character.setName(character.id, value);
            updateDisplay_name();
        }
    }

    function action_setStats() {
        let systemClass = System.getClass(Character.getSystem(config.character));
        let stats = systemClass.getAllStats();

        let result = false;
        // noinspection JSAssignmentUsedAsCondition
        for (let i = 0, statGroup; statGroup = stats[i]; i++) {
            // noinspection JSAssignmentUsedAsCondition
            for (let j = 0, stat; stat = statGroup[j]; j++) {
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

    /**
     * @param {GameStat} stat
     * @return {boolean|null}
     */
    function action_setStat(stat) {
        let stats = Character.getStats(config.character);

        let value = prompt('Set ' + stat.name + ' to:', stats[stat.id]);
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
        let pageConfig = LocalStorage.get('page-character');
        if (pageConfig && typeof pageConfig.character === 'number') {
            config.character = pageConfig.character;
        }
        data_setCharacterDataAttribute();
    }

    function data_save() {
        let oldConfig = LocalStorage.get('page-character');
        let pageNeedsRefresh = typeof oldConfig !== 'object';
        if (!pageNeedsRefresh) {
            let changes = Utility.getObjectUpdateList(oldConfig, config);
            pageNeedsRefresh = changes.length > 0;
        }

        LocalStorage.set('page-character', config);

        data_setCharacterDataAttribute();

        if (pageNeedsRefresh) {
            updateDisplay_refreshPage();
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
        $(function () {
            $(document.body).attr('data-character', config.character || 'none');
        });
    }

    function data_setStat(statId, value) {
        let updatedStats = Character.setStat(config.character, statId, value);
        // noinspection JSAssignmentUsedAsCondition
        for (let i = 0, updatedStat; updatedStat = updatedStats[i]; i++) {
            updateDisplay_statValue(updatedStat);
        }
    }

    // ************************** //
    // ***** INITIALIZATION ***** //
    // ************************** //

    data_load();
};
