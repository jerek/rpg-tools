window.Page_Settings = new function () {
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

    /**
     * Sets up the Settings page.
     *
     * @param {jQuery} target
     */
    this.init = function (target) {
        elements.container = target;

        elements.heading && elements.heading.remove && elements.heading.remove();
        elements.body && elements.body.remove && elements.body.remove();

        elements.heading = Utility.addElement('settings-heading', elements.container, {
            element: 'h1',
            text: 'Settings',
        });

        elements.body = Utility.addElement('settings-body', elements.container);

        Utility.addElement('settings-sub-heading', elements.body, {
            element: 'h2',
            text: 'Import',
        });

        let importTextarea = Utility.addElement(null, elements.body, 'textarea');

        let importButton = Utility.addElement(null, elements.body, 'button');
        importButton.html('<i class="fa fa-download"></i> Import');
        importButton.click(onImportData.bind(importButton, importTextarea));

        Utility.addElement('settings-sub-heading', elements.body, {
            element: 'h2',
            text: 'Export',
        });

        let exportTextarea = Utility.addElement(null, elements.body, 'textarea');
        exportTextarea.text(JSON.stringify(localStorage));

        let copyButton = Utility.addElement(null, elements.body, 'button');
        copyButton.html('<i class="fa fa-clipboard"></i> Copy');
        let copyRevertTimeout;
        copyButton.click(function () {
            exportTextarea.focus();
            exportTextarea.select();
            if (!document.execCommand('copy')) {
                prompt(null, exportTextarea.val());
            }
            exportTextarea.blur();

            copyButton.html('<i class="fa fa-check"></i> Copied');

            clearTimeout(copyRevertTimeout);
            copyRevertTimeout = setTimeout(function () {
                copyButton.html('<i class="fa fa-clipboard"></i> Copy');
            }, 2000);
        });
    };

    // ------- //
    // PRIVATE //
    // ------- //

    /**
     * Imports the data from the given textarea, replacing all current data.
     *
     * @param {jQuery} importTextarea
     */
    function onImportData(importTextarea) {
        let data;
        try {
            data = JSON.parse(importTextarea.val());
        } catch (e) {
            alert('Import failed. Could not parse data.');

            return;
        }

        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            alert('Import failed. Invalid data format.');

            return;
        }

        if (!Object.keys(data).length) {
            alert('Import failed. Data object is empty.');

            return;
        }

        // If the current browser already has some of these settings, make sure the user knows they'll be replaced.
        let warnings = [];
        let replacedSettings = [];
        for (let property in data) {
            if (data.hasOwnProperty(property) && localStorage.hasOwnProperty(property)) {
                replacedSettings.push(property);
            }
        }
        if (replacedSettings.length) {
            warnings.push(
                'Importing this data will REPLACE the following data in this browser: "' +
                replacedSettings.join('", "') + '".\n\n'
            );
        }
        let deletedSettings = [];
        for (let property in localStorage) {
            if (localStorage.hasOwnProperty(property) && !data.hasOwnProperty(property)) {
                deletedSettings.push(property);
            }
        }
        if (deletedSettings.length) {
            warnings.push(
                'Importing this data will DELETE the following data in this browser: "' +
                deletedSettings.join('", "') + '".\n\n'
            );
        }
        if (replacedSettings.length) {
            let response = prompt(warnings.join('') + 'Are you sure you want to continue? Type "yes" to confirm.');
            if (response !== 'yes') {
                alert('Cancelling data import.');

                return;
            }
        }

        // Clear all current settings.
        for (let property in localStorage) {
            if (localStorage.hasOwnProperty(property)) {
                localStorage.removeItem(property);
            }
        }

        // Import all new settings.
        for (let property in data) {
            if (data.hasOwnProperty(property)) {
                localStorage.setItem(property, data[property]);
            }
        }

        alert('Data import complete.');
        location.href = location.origin + '/';
    }
};
