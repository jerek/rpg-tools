window.Character = new function () {
    // *********************** //
    // ***** DEFINITIONS ***** //
    // *********************** //

    /**
     * @typedef Character
     * @property {number}                  id
     * @property {string}                  name
     * @property {Object.<string, number>} stats
     * @property {string}                  system The string ID of this character's game system.
     */

    // ********************* //
    // ***** CONSTANTS ***** //
    // ********************* //

    const config = {
        highestId: 0,
    };

    /** @type {Character} The default settings for a character. */
    const characterTemplate = {
        id: 1,
        name: 'Unnamed Character',
        stats: {},
        system: 'deciv',
    };

    // ********************* //
    // ***** VARIABLES ***** //
    // ********************* //

    /** @type {Object.<number, Character>} A lookup of all characters loaded from local storage. */
    const characters = {};

    // ********************* //
    // ***** FUNCTIONS ***** //
    // ********************* //

    // ------ //
    // PUBLIC //
    // ------ //

    this.create = function (name, system) {
        let highestId = config.highestId;
        for (let id in characters) {
            if (characters.hasOwnProperty(id) && characters[id] && characters[id].id > highestId) {
                highestId = characters[id].id;
            }
        }
        let newId = highestId + 1;

        characters[newId] = $.extend(true, {}, characterTemplate, {
            id: newId,
            name: name,
            system: system || 'deciv',
        });

        config.highestId = newId;

        data_save();

        return newId;
    };

    /**
     * @param {number} characterId
     * @returns {Character}
     */
    this.get = function (characterId) {
        return characters[characterId] ?
            $.extend(true, {}, characters[characterId]) :
            null;
    };

    this.delete = function (characterId) {
        if (characters[characterId]) {
            if (confirm('Are you sure you want to delete "' + characters[characterId].name + '"?')) {
                if (confirm('If you delete "' + characters[characterId].name + '" you CANNOT get them back!')) {
                    delete characters[characterId];
                    data_save();
                    return true;
                }
            }
        }
        return false;
    };

    this.getCharacters = function () {
        return Utility.sortObject(characters, function (a, b) {
            return a.name.localeCompare(b.name);
        });
    };

    /**
     * @param {number} characterId
     * @returns {string|null}
     */
    this.getName = function (characterId) {
        return characters[characterId] && characters[characterId].name || 'Character #' + characterId;
    };

    /**
     * @param {number} characterId
     * @param {string} value
     * @returns {boolean}
     */
    this.setName = function (characterId, value) {
        if (typeof value === 'string' && value && characters[characterId] && characters[characterId].name !== value) {
            characters[characterId].name = value;
            data_save(characterId);

            return true;
        }

        return false;
    };

    /**
     * @param {number} characterId
     * @param {number} stat
     */
    this.getStat = function (characterId, stat) {
        if (characters[characterId] && characters[characterId].stats.hasOwnProperty(stat)) {
            return characters[characterId].stats[stat];
        }

        return null;
    };

    /**
     * @param {number} characterId
     * @param {number} stat
     * @param {number} value
     */
    this.setStat = function (characterId, stat, value) {
        if (!characters[characterId]) {
            return;
        }

        let updatedStats = [];

        value = parseInt(value, 10);
        if (!isNaN(value) && characters[characterId].stats[stat] !== value) {
            characters[characterId].stats[stat] = value;
            updatedStats = data_save(characterId);
        }

        return updatedStats;
    };

    this.getStats = function (characterId) {
        if (characters[characterId]) {
            return characters[characterId].stats;
        }

        return null;
    };

    /**
     * @param {number} characterId
     * @returns {string|null}
     */
    this.getSystem = function (characterId) {
        if (characters[characterId] && characters[characterId].system) {
            return characters[characterId].system;
        }

        return null;
    };

    this.sort = function (a, b) {
        // General Rolls last
        if (!a.id) {
            return 1;
        } else if (!b.id) {
            return -1;
        }

        // Nameless deleted characters go after named undeleted characters
        if (a.name.match(/^Character #[0-9]+$/)) {
            return 1;
        } else if (b.name.match(/^Character #[0-9]+$/)) {
            return -1;
        }

        // Sort existing non-general characters by name...
        if (a.name.toLowerCase() < b.name.toLowerCase()) {
            return -1;
        } else if (b.name.toLowerCase() < a.name.toLowerCase()) {
            return 1;
        }

        // ...then by system name...
        if (a.system && !b.system) {
            return -1;
        } else if (!a.system && b.system) {
            return 1;
        } else if (a.system && b.system) {
            if (a.system < b.system) {
                return -1;
            } else if (a.system > b.system) {
                return 1;
            }
        }

        // ...and finally be ID
        return a.id - b.id;
    };

    // ------- //
    // PRIVATE //
    // ------- //

    function data_load() {
        config.highestId = LocalStorage.get('characters-highest-id') || 0;

        let characterData = LocalStorage.get('characters');
        if (typeof characterData === 'object') {
            for (let characterId in characterData) {
                if (characterData.hasOwnProperty(characterId)) {
                    characters[characterId] = $.extend(true, {}, characterTemplate, characterData[characterId]);
                }
            }
        }
    }

    /**
     * @param {number} [characterId]
     */
    function data_save(characterId) {
        LocalStorage.set('characters-highest-id', config.highestId);

        if (characterId) {
            data_updateCalculatedStats(characterId);

            let lastSave = LocalStorage.get('characters');
            let updatedStats = Utility.getObjectUpdateList(
                lastSave && lastSave[characterId] ? lastSave[characterId].stats : {},
                characters[characterId].stats
            );

            LocalStorage.set('characters', characters);

            return updatedStats;
        } else {
            LocalStorage.set('characters', characters);
        }
    }

    function data_updateCalculatedStats(characterId) {
        let systemClass = System.getClass(characters[characterId].system);
        let stats = systemClass.getAllStats();

        // noinspection JSAssignmentUsedAsCondition
        for (let i = 0, statGroup; statGroup = stats[i]; i++) {
            // noinspection JSAssignmentUsedAsCondition
            for (let j = 0, stat; stat = statGroup[j]; j++) {
                if (stat.formula) {
                    switch (stat.formula.type) {
                        case 'lowest':
                            let lowestStats = [];
                            // noinspection JSAssignmentUsedAsCondition
                            for (let k = 0, lowestStat; lowestStat = stat.formula.stats[k]; k++) {
                                lowestStats.push(parseInt(characters[characterId].stats[lowestStat]) || 0);
                            }
                            characters[characterId].stats[stat.id] = Math.min.apply(Math, lowestStats);
                            break;
                        case 'highest':
                            let highestStats = [];
                            // noinspection JSAssignmentUsedAsCondition
                            for (let k = 0, highestStat; highestStat = stat.formula.stats[k]; k++) {
                                highestStats.push(parseInt(characters[characterId].stats[highestStat]) || 0);
                            }
                            characters[characterId].stats[stat.id] = Math.max.apply(Math, highestStats);
                            break;
                        case 'average':
                            let numbersToAverage = [];
                            // noinspection JSAssignmentUsedAsCondition
                            for (let k = 0, numberToAverage; numberToAverage = stat.formula.stats[k]; k++) {
                                numbersToAverage.push(parseInt(characters[characterId].stats[numberToAverage]) || 0);
                            }
                            let average = Utility.average(numbersToAverage);
                            switch (stat.formula.round) {
                                case 'down':
                                    average = Math.floor(average);
                                    break;
                                case 'up':
                                    average = Math.ceil(average);
                                    break;
                                default:
                                    average = Math.round(average);
                            }
                            characters[characterId].stats[stat.id] = average;
                            break;
                        default:
                            alert('Unknown formula type!\nType: ' + stat.formula.type);
                    }
                }
            }
        }
    }

    // ************************** //
    // ***** INITIALIZATION ***** //
    // ************************** //

    data_load();
};
