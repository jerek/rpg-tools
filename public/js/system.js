var System = new function () {
    // ********************* //
    // ***** CONSTANTS ***** //
    // ********************* //

    var config = {
        systems: {
            deciv: {
                id: 'deciv',
                name: 'Deciv',
                'class': 'Deciv',
            },
        },
    };

    // ********************* //
    // ***** FUNCTIONS ***** //
    // ********************* //

    /**
     * @returns {Array}
     */
    this.getSystems = function () {
        var systems = [];

        for (var system in config.systems) {
            if (config.systems.hasOwnProperty(system)) {
                systems.push(system);
            }
        }

        return systems;
    };

    /**
     * @param {string} systemId
     * @returns {object|null}
     */
    this.getClass = function (systemId) {
        if (config.systems[systemId]) {
            return window['System_' + config.systems[systemId]['class']];
        }

        return null;
    };

    /**
     * @param {string} systemId
     * @returns {object|null}
     */
    this.getConfig = function (systemId) {
        return config.systems[systemId] || null;
    };
};
