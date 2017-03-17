var System_Deciv = new function() {
    var config = {
        rollDirection: -1,
        statType: 'against'
    };
    var attributes = [
        { id: 'athleticism', name: 'Athleticism', die: 20 },
        { id: 'strength',    name: 'Strength',    die: 20, secondary: true },
        { id: 'agility',     name: 'Agility',     die: 20, secondary: true },
        { id: 'toughness',   name: 'Toughness',   die: 20 },
        { id: 'health',      name: 'Health',      die: 20, secondary: true },
        { id: 'resolve',     name: 'Resolve',     die: 20, secondary: true },
        { id: 'perception',  name: 'Perception',  die: 20 },
        { id: 'intellect',   name: 'Intellect',   die: 20, secondary: true },
        // { id: 'awareness',   name: 'Awareness',   die: 20, secondary: true },
        { id: 'dexterity',   name: 'Dexterity',   die: 20, secondary: true },
        { id: 'charisma',    name: 'Charisma',    die: 20 },
        // { id: 'allure',      name: 'Allure',      die: 20, secondary: true },
        { id: 'affinity',    name: 'Affinity',    die: 20, secondary: true },
        { id: 'influence',   name: 'Influence',   die: 20, secondary: true }
    ];
    var specialAttributes = [
        { id: 'luck',        name: 'Luck',        die: 20 },
        { id: 'initiative',  name: 'Initiative',  die: 20, formula: {
            type: 'lowest',
            stats: ['perception', 'agility']
        } }
    ];
    var technicalAttributes = [
        { id: 'melee',    name: 'Melee',    die: 20 },
        { id: 'guns',     name: 'Guns',     die: 20 },
        { id: 'stealth',  name: 'Stealth',  die: 20 },
        { id: 'survival', name: 'Survival', die: 20 },
        { id: 'social',   name: 'Social',   die: 20 },
        { id: 'trading',  name: 'Trading',  die: 20 },
        { id: 'medical',  name: 'Medical',  die: 20 },
        { id: 'tech',     name: 'Tech',     die: 20 },
        { id: 'science',  name: 'Science',  die: 20 },
        { id: 'crafting', name: 'Crafting', die: 20 }
    ];

    this.getConfig = function() {
        return $.extend(true, {}, config);
    };

    this.getAllStats = function() {
        return [
            this.getAttributes(),
            this.getSpecialAttributes(),
            this.getTechnicalAttributes()
        ];
    };

    this.getStat = function(attributeId) {
        var attributes = this.getAllStats();

        for (var i = 0, statGroup; statGroup = attributes[i]; i++) {
            for (var j = 0, attribute; attribute = statGroup[j]; j++) {
                if (attribute.id == attributeId) {
                    return $.extend(true, {}, attribute);
                }
            }
        }

        return null;
    };

    this.getAttributes = function() {
        return $.extend(true, [], attributes);
    };

    this.getSpecialAttributes = function() {
        return $.extend(true, [], specialAttributes);
    };

    this.getTechnicalAttributes = function() {
        return $.extend(true, [], technicalAttributes);
    };
};
