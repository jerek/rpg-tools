window.Page_Stats = new function () {
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

        display_heading();
        display_body();
    };

    // ------- //
    // PRIVATE //
    // ------- //

    function display_heading() {
        elements.heading && elements.heading.remove && elements.heading.remove();

        elements.heading = Utility.addElement('statistics-heading', elements.container, {
            element: 'h1',
            text: 'Statistics',
        });
    }

    function display_body() {
        let allRolls = Dice.getRolls();

        if ($.isEmptyObject(allRolls)) {
            Utility.addElement(null, elements.container, {
                element: 'p',
                text: 'No rolls yet!',
            });
            return;
        }

        let rolls = {};
        for (let sides in allRolls) {
            if (!allRolls.hasOwnProperty(sides)) {
                continue;
            }

            // noinspection JSAssignmentUsedAsCondition
            for (let i = 0, roll; roll = allRolls[sides][i]; i++) {
                let groupId = roll.character || 0;

                if (!rolls[groupId]) {
                    rolls[groupId] = {};
                }

                if (!rolls[groupId][sides]) {
                    rolls[groupId][sides] = [];
                }

                rolls[groupId][sides].push(roll);
            }
        }

        let characterIds = [];
        for (let charId in rolls) {
            if (rolls.hasOwnProperty(charId) && characterIds.indexOf(charId)) {
                characterIds.push(charId);
            }
        }

        let characters = [];
        // noinspection JSAssignmentUsedAsCondition
        for (let j = 0, characterId; characterId = characterIds[j]; j++) {
            if (!characterId) {
                characters.push({
                    id: characterId,
                    name: 'General Rolls',
                });
            } else {
                characters.push($.extend(true, {}, Character.get(characterId) || {}, {
                    id: characterId,
                    name: Character.getName(characterId),
                }));
            }
        }

        let getMostRecentRoll = function (characterId) {
            let mostRecent = '2000-01-01 00:00:00';

            if (!rolls[characterId]) {
                return mostRecent;
            }

            let mostRecentDate = new Date(mostRecent);
            for (let sides in rolls[characterId]) {
                if (rolls[characterId].hasOwnProperty(sides)) {
                    let rollDate = new Date(rolls[characterId][sides][rolls[characterId][sides].length - 1].datetime);
                    if (rollDate > mostRecentDate) {
                        mostRecentDate = rollDate;
                    }
                }
            }

            return mostRecentDate;
        };

        characters.sort(function (a, b) {
            return getMostRecentRoll(a.id) > getMostRecentRoll(b.id) ? -1 : 1;
        });

        elements.body = Utility.addElement('statistics-body', elements.container);
        // noinspection JSAssignmentUsedAsCondition
        for (let k = 0, character; character = characters[k]; k++) {
            Utility.addElement('statistics-character-name', elements.body, {
                element: 'h2',
                text: character.name,
            });

            display_rolls(character, rolls[character.id], elements.body);
        }
    }

    function display_rolls(character, rolls, target) {
        for (let sides in rolls) {
            if (rolls.hasOwnProperty(sides)) {
                Utility.addElement('statistics-character-rolls-heading', target, {
                    element: 'h3',
                    text: 'd' + sides,
                });

                Utility.addElement(null, target, {
                    element: 'p',
                    text: 'Total rolls: ' + rolls[sides].length,
                });

                Utility.addElement(null, target, {
                    element: 'p',
                    text: 'Average roll: ' + Math.round(Utility.propertyAverage(rolls[sides], 'result') * 10) / 10,
                });
            }
        }
    }
};
