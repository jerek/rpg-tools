var Page_Stats = new function() {
    var elements = {
        stats: {}
    };

    this.init = function(target) {
        elements.container = target;

        display_heading();
        display_body();
    };

    function display_heading() {
        elements.heading && elements.heading.remove && elements.heading.remove();

        elements.heading = Utility.addElement('statistics-heading', elements.container, {
            element: 'h1',
            text: 'Statistics'
        });
    }

    function display_body() {
        var allRolls = Dice.getRolls();

        if ($.isEmptyObject(allRolls)) {
            Utility.addElement(null, elements.container, {
                element: 'p',
                text: 'No rolls yet!'
            });
            return;
        }

        var rolls = {};
        for (var sides in allRolls) {
            if (!allRolls.hasOwnProperty(sides)) {
                continue;
            }

            for (var i = 0, roll; roll = allRolls[sides][i]; i++) {
                var groupId = roll.character || 0;

                if (!rolls[groupId]) {
                    rolls[groupId] = {};
                }

                if (!rolls[groupId][sides]) {
                    rolls[groupId][sides] = [];
                }

                rolls[groupId][sides].push(roll);
            }
        }

        var characterIds = [];
        for (var charId in rolls) {
            if (rolls.hasOwnProperty(charId) && characterIds.indexOf(charId)) {
                characterIds.push(charId);
            }
        }

        var characters = [];
        for (var j = 0, characterId; characterId = characterIds[j]; j++) {
            if (characterId == 0) {
                characters.push({
                    id: characterId,
                    name: 'General Rolls'
                });
            } else {
                characters.push($.extend(true, {}, Character.get(characterId) || {}, {
                    id: characterId,
                    name: Character.getName(characterId)
                }));
            }
        }

        var getMostRecentRoll = function(characterId) {
            var mostRecent = '2000-01-01 00:00:00';

            if (!rolls[characterId]) {
                return mostRecent;
            }

            var mostRecentDate = new Date(mostRecent);
            for (var sides in rolls[characterId]) {
                if (rolls[characterId].hasOwnProperty(sides)) {
                    var rollDate = new Date(rolls[characterId][sides][rolls[characterId][sides].length - 1].datetime);
                    if (rollDate > mostRecentDate) {
                        mostRecentDate = rollDate;
                    }
                }
            }

            return mostRecentDate;
        };

        characters.sort(function(a, b) {
            return getMostRecentRoll(a.id) > getMostRecentRoll(b.id) ? -1 : 1;
        });

        elements.body = Utility.addElement('statistics-body', elements.container);
        for (var k = 0, character; character = characters[k]; k++) {
            Utility.addElement('statistics-character-name', elements.body, {
                element: 'h2',
                text: character.name
            });

            display_rolls(character, rolls[character.id], elements.body);
        }
    }

    function display_rolls(character, rolls, target) {
        for (var sides in rolls) {
            if (rolls.hasOwnProperty(sides)) {
                Utility.addElement('statistics-character-rolls-heading', target, {
                    element: 'h3',
                    text: 'd' + sides
                });

                Utility.addElement(null, target, {
                    element: 'p',
                    text: 'Total rolls: ' + rolls[sides].length
                });

                Utility.addElement(null, target, {
                    element: 'p',
                    text: 'Average roll: ' + Math.round(Utility.propertyAverage(rolls[sides], 'result') * 10) / 10
                });
            }
        }
    }
};
