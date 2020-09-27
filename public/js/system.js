window.System = new function () {
    const self = this;
    const Utility = window.Utility;

    // *********************** //
    // ***** DEFINITIONS ***** //
    // *********************** //

    /**
     * @typedef {{min: number, location: string}} GameBodyLocation A system's list of body locations, and their minimum
     * hit location rolls to match them, as determined by a d100 roll. This list MUST be ordered highest to lowest.
     */

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

    // ------ //
    // PUBLIC //
    // ------ //

    /** @type {string} The default system ID. */
    this.DEFAULT_SYSTEM = 'deciv';

    // ------- //
    // PRIVATE //
    // ------- //

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
     * Returns this system's list of body locations, as determined by a d100 roll.
     *
     * @param {string} systemId
     * @return {GameBodyLocation[]}
     */
    this.getBodyLocations = function (systemId) {
        let systemClass = self.getClass(systemId);
        if (!systemClass) {
            Utility.error('No class found for ' + JSON.stringify(systemId) + ' system.');

            return [];
        }

        return systemClass.getBodyLocations();
    };

    /**
     * @param {string} systemId
     * @returns {object|null}
     */
    this.getClass = function (systemId) {
        let systemConfig = self.getConfig(systemId);
        if (!systemConfig) {
            Utility.error('No configuration found for ' + JSON.stringify(systemId) + ' system.');

            return null;
        }

        return window['System_' + systemConfig['class']];
    };

    /**
     * @param {string} systemId
     * @returns {GameSystem|null}
     */
    this.getConfig = function (systemId) {
        return config.systems[systemId] || null;
    };

    /**
     * Returns a list of string IDs of available game systems.
     *
     * @returns {string[]}
     */
    this.getSystemIds = function () {
        let systemIds = [];

        for (let systemId in config.systems) {
            if (config.systems.hasOwnProperty(systemId)) {
                systemIds.push(systemId);
            }
        }

        return systemIds;
    };
};
