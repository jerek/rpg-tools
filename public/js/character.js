var Character = new function() {
    var config = {
        highestId: 0
    };
    var characters = {};
    var characterTemplate = {
        id: 1,
        name: 'Unnamed Character',
        stats: {},
        system: 'deciv'
    };

    this.create = function(name, system) {
        var highestId = config.highestId;
        for (var id in characters) {
            if (characters.hasOwnProperty(id) && typeof characters[id] == 'object' && characters[id] && characters[id].id > highestId) {
                highestId = characters[id].id;
            }
        }
        var newId = highestId + 1;

        characters[newId] = $.extend(true, {}, characterTemplate, {
            id: newId,
            name: name,
            system: system || 'deciv'
        });

        config.highestId = newId;

        data_save();

        return newId;
    };

    /**
     * @param {number} characterId
     * @returns {object}
     */
    this.get = function(characterId) {
        return characters[characterId] ?
            $.extend(true, {}, characters[characterId]) :
            null;
    };

    this.getCharacters = function() {
        return Utility.sortObject(characters, function(a, b) {
            return a.name.localeCompare(b.name);
        });
    };

    /**
     * @param {number} characterId
     * @returns {string|null}
     */
    this.getName = function(characterId) {
        return characters[characterId] && characters[characterId].name || null;
    };

    /**
     * @param {number} characterId
     * @param {string} value
     * @returns {boolean}
     */
    this.setName = function(characterId, value) {
        if (typeof value == 'string' &&  value && characters[characterId] && characters[characterId].name != value) {
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
    this.getStat = function(characterId, stat) {
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
    this.setStat = function(characterId, stat, value) {
        if (!characters[characterId]) {
            return;
        }

        var updatedStats = [];

        value = parseInt(value, 10);
        if (!isNaN(value) && characters[characterId].stats[stat] !== value) {
            characters[characterId].stats[stat] = value;
            updatedStats = data_save(characterId);
        }

        return updatedStats;
    };

    this.getStats = function(characterId) {
        if (characters[characterId]) {
            return characters[characterId].stats;
        }

        return null;
    };

    /**
     * @param {number} characterId
     * @returns {string|null}
     */
    this.getSystem = function(characterId) {
        if (characters[characterId] && characters[characterId].system) {
            return characters[characterId].system;
        }

        return null;
    };

    function data_load() {
        config.highestId = LocalStorage.get('characters-highest-id') || 0;

        var characterData = LocalStorage.get('characters');
        if (typeof characterData == 'object') {
            for (var characterId in characterData) {
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

            var lastSave = LocalStorage.get('characters');
            var updatedStats = Utility.getObjectUpdateList(lastSave && lastSave[characterId] ? lastSave[characterId].stats : {}, characters[characterId].stats);

            LocalStorage.set('characters', characters);

            return updatedStats;
        } else {
            LocalStorage.set('characters', characters);
        }
    }

    function data_updateCalculatedStats(characterId) {
        var systemClass = System.getClass(characters[characterId].system);
        var stats = systemClass.getAllStats();

        for (var i = 0, statGroup; statGroup = stats[i]; i++) {
            for (var j = 0, stat; stat = statGroup[j]; j++) {
                if (stat.formula) {
                    switch (stat.formula.type) {
                        case 'lowest':
                            var lowestStats = [];
                            for (var k = 0, lowestStat; lowestStat = stat.formula.stats[k]; k++) {
                                lowestStats.push(parseInt(characters[characterId].stats[lowestStat]) || 0);
                            }
                            characters[characterId].stats[stat.id] = Math.min.apply(Math, lowestStats);
                            break;
                        case 'highest':
                            var highestStats = [];
                            for (var l = 0, highestStat; highestStat = stat.formula.stats[l]; l++) {
                                highestStats.push(parseInt(characters[characterId].stats[highestStat]) || 0);
                            }
                            characters[characterId].stats[stat.id] = Math.max.apply(Math, highestStats);
                            break;
                        case 'average':
                            var numbersToAverage = [];
                            for (var m = 0, numberToAverage; numberToAverage = stat.formula.stats[m]; m++) {
                                numbersToAverage.push(parseInt(characters[characterId].stats[numberToAverage]) || 0);
                            }
                            var average = Utility.average(numbersToAverage);
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

    data_load();
};
