var System_Deciv = new function() {
    var config = {
        rollDirection: -1,
        statType: 'against'
    };
    var attributes = [
        { id: 'athleticism', name: 'Athleticism', die: 20 },
        { id: 'strength',    name: 'Strength',    die: 20 },
        { id: 'agility',     name: 'Agility',     die: 20 },
        { id: 'toughness',   name: 'Toughness',   die: 20 },
        { id: 'health',      name: 'Health',      die: 20 },
        { id: 'resolve',     name: 'Resolve',     die: 20 },
        { id: 'perception',  name: 'Perception',  die: 20 },
        { id: 'intellect',   name: 'Intellect',   die: 20 },
        { id: 'awareness',   name: 'Awareness',   die: 20 },
        { id: 'charisma',    name: 'Charisma',    die: 20 },
        { id: 'allure',      name: 'Allure',      die: 20 },
        { id: 'influence',   name: 'Influence',   die: 20 }
    ];
    var technicalAttributes = [
        { id: 'melee',    name: 'Melee',    die: 20 },
        { id: 'guns',     name: 'Guns',     die: 20 },
        { id: 'stealth',  name: 'Stealth',  die: 20 },
        { id: 'survival', name: 'Survival', die: 20 },
        { id: 'social',   name: 'Social',   die: 20 },
        { id: 'medical',  name: 'Medical',  die: 20 },
        { id: 'tech',     name: 'Tech',     die: 20 },
        { id: 'science',  name: 'Science',  die: 20 },
        { id: 'crafting', name: 'Crafting', die: 20 }
    ];

    this.getConfig = function() {
        return config;
    };

    this.getAttributes = function() {
        return attributes;
    };

    this.getTechnicalAttributes = function() {
        return technicalAttributes;
    };
};
