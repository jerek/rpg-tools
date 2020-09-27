window.System = new function () {
    // *********************** //
    // ***** DEFINITIONS ***** //
    // *********************** //

    /**
     * @typedef {Object} GameStat
     * @property {string}  id          A unique string ID.
     * @property {string}  name        The display name of this stat.
     * @property {number}  die         The die side number to use when rolling this stat.
     * @property {boolean} [secondary] Whether to visually distinguish this stat as being less significant than others.
     */

    /**
     * @typedef {Object} GameSystem
     * @property {string} id    A unique string ID.
     * @property {string} name  The display name of this game system.
     * @property {string} class The JS pseudo-class to use.
     */

    // ********************* //
    // ***** CONSTANTS ***** //
    // ********************* //

    const ID_DECIV = 'deciv';

    /** @type {{systems: Object}} */
    const config = {
        /** @type {Object} */
        systems: {
            [ID_DECIV]: {
                id: ID_DECIV,
                name: 'Deciv',
                'class': 'Deciv',
            },
        },
    };

    // ********************* //
    // ***** FUNCTIONS ***** //
    // ********************* //

    /**
     * Returns a list of string IDs of available game systems.
     *
     * @returns {string[]}
     */
    this.getSystemIds = function () {
        let systems = [];

        for (let system in config.systems) {
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
     * @returns {GameSystem|null}
     */
    this.getConfig = function (systemId) {
        return config.systems[systemId] || null;
    };
};
