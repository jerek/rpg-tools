window.System_Deciv = new function () {
    // ********************* //
    // ***** CONSTANTS ***** //
    // ********************* //

    const config = {
        rollDirection: -1,
        statType: 'against',
    };

    /** @type {GameStat[]} */
    const attributes = [
        {id: 'athleticism', name: 'Athleticism', die: 20},
        {id: 'strength',    name: 'Strength',    die: 20, secondary: true},
        {id: 'agility',     name: 'Agility',     die: 20, secondary: true},
        {id: 'toughness',   name: 'Toughness',   die: 20},
        {id: 'health',      name: 'Health',      die: 20, secondary: true},
        {id: 'resolve',     name: 'Resolve',     die: 20, secondary: true},
        {id: 'perception',  name: 'Perception',  die: 20},
        {id: 'intellect',   name: 'Intellect',   die: 20, secondary: true},
        // {id: 'awareness',   name: 'Awareness',   die: 20, secondary: true},
        {id: 'dexterity',   name: 'Dexterity',   die: 20, secondary: true},
        {id: 'charisma',    name: 'Charisma',    die: 20},
        // {id: 'allure',      name: 'Allure',      die: 20, secondary: true},
        {id: 'affinity',    name: 'Affinity',    die: 20, secondary: true},
        {id: 'influence',   name: 'Influence',   die: 20, secondary: true},
    ];

    /** @type {GameBodyLocation[]} See the GameBodyLocation typedef. */
    const BODY_LOCATIONS = [
        {min: 96, location: 'Foot'},
        {min: 91, location: 'Hand'},
        {min: 81, location: 'Lower Leg'},
        {min: 71, location: 'Hip/Upper Leg'},
        {min: 61, location: 'Arm'},
        {min: 51, location: 'Shoulder'},
        {min: 46, location: 'Pelvic Area'},
        {min: 31, location: 'Lower Torso'},
        {min: 16, location: 'Upper Torso'},
        {min: 11, location: 'Neck'},
        {min: 1,  location: 'Head'},
    ];

    /** @type {GameStat[]} */
    const specialAttributes = [
        {id: 'luck', name: 'Luck', die: 20},
        {
            id: 'initiative', name: 'Initiative', die: 20, formula: {
                type: 'lowest',
                stats: ['perception', 'agility'],
            },
        },
    ];

    /** @type {GameStat[]} */
    const technicalAttributes = [
        {id: 'melee',    name: 'Melee',    die: 20},
        {id: 'guns',     name: 'Guns',     die: 20},
        {id: 'stealth',  name: 'Stealth',  die: 20},
        {id: 'survival', name: 'Survival', die: 20},
        {id: 'social',   name: 'Social',   die: 20},
        {id: 'trading',  name: 'Trading',  die: 20},
        {id: 'medical',  name: 'Medical',  die: 20},
        {id: 'tech',     name: 'Tech',     die: 20},
        {id: 'science',  name: 'Science',  die: 20},
        {id: 'crafting', name: 'Crafting', die: 20},
    ];

    // ********************* //
    // ***** FUNCTIONS ***** //
    // ********************* //

    this.getConfig = function () {
        return $.extend(true, {}, config);
    };

    this.getAllStats = function () {
        return [
            this.getAttributes(),
            this.getSpecialAttributes(),
            this.getTechnicalAttributes(),
        ];
    };

    /**
     * Returns this system's list of body locations, as determined by a d100 roll.
     *
     * @return {GameBodyLocation[]}
     */
    this.getBodyLocations = function () {
        return JSON.parse(JSON.stringify(BODY_LOCATIONS));
    };

    this.getStat = function (attributeId) {
        let attributes = this.getAllStats();

        // noinspection JSAssignmentUsedAsCondition
        for (let i = 0, statGroup; statGroup = attributes[i]; i++) {
            // noinspection JSAssignmentUsedAsCondition
            for (let j = 0, attribute; attribute = statGroup[j]; j++) {
                if (attribute.id === attributeId) {
                    return $.extend(true, {}, attribute);
                }
            }
        }

        return null;
    };

    this.getAttributes = function () {
        return $.extend(true, [], attributes);
    };

    this.getSpecialAttributes = function () {
        return $.extend(true, [], specialAttributes);
    };

    this.getTechnicalAttributes = function () {
        return $.extend(true, [], technicalAttributes);
    };
};
