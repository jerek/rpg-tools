window.Base = new function () {
    // ********************* //
    // ***** CONSTANTS ***** //
    // ********************* //

    const config = {
        pages: {
            '404': {
                name: 'Page Not Found',
                path: '404',
                root: null,
            },
            character: {
                name: 'Character',
                path: 'character',
                root: 'character',
            },
            dice: {
                name: 'Dice',
                path: 'dice',
                root: 'dice',
            },
            home: {
                name: 'Home',
                path: '',
                root: 'home',
            },
            randomWords: {
                name: 'Random Words',
                path: 'random-words',
                root: 'random-words',
            },
            settings: {
                name: 'Settings',
                path: 'settings',
                root: 'settings',
            },
            stats: {
                name: 'Stats',
                path: 'stats',
                root: 'stats',
            },
        },
        nav: [
            'home',
            'dice',
            'character',
            'stats',
            'randomWords',
            'settings',
        ],
    };

    // ********************* //
    // ***** VARIABLES ***** //
    // ********************* //

    /** @type {Object} References to various DOM elements. */
    const elements = {};

    const status = {
        lockHash: false,
    };

    // ********************* //
    // ***** FUNCTIONS ***** //
    // ********************* //

    function init() {
        elements.wrapper = Utility.addElement('wrapper', document.body);
        elements.header = Utility.addElement('header', elements.wrapper);
        elements.body = Utility.addElement('body', elements.wrapper);

        display_header(elements.header);

        $(window).on('hashchange', action_nav);
        action_nav();
    }

    function display_header(target) {
        elements.headerInner = Utility.addElement('header-inner', target);
        elements.logo = Utility.addElement('logo', elements.headerInner);
        elements.nav = Utility.addElement('nav', elements.headerInner, 'nav');
        elements.navInner = Utility.addElement('nav-inner', elements.nav, 'ul');

        display_navigation(elements.navInner);
    }

    function display_navigation(target) {
        target.empty();
        // noinspection JSAssignmentUsedAsCondition
        for (let i = 0, navKey; navKey = config.nav[i]; i++) {
            display_navigationItem(target, config.pages[navKey]);
        }
    }

    function display_navigationItem(target, navItem) {
        let li = Utility.addElement(null, target, {
            element: 'li',
            id: 'nav-page-' + navItem.root,
        });
        let a = Utility.addElement(null, li, {
            element: 'a',
            href: '#' + navItem.path,
        });
        a.html(navItem.name);
    }

    function display_page(pageObject) {
        $(document.body).attr('data-page', pageObject.path || pageObject.root);
        let pageClassName = utility_ucFirst(utility_camelCase(pageObject.path || 'home'));
        if (window['Page_' + pageClassName]) {
            elements.body.empty();
            window['Page_' + pageClassName].init(elements.body);
        } else {
            display_page(config.pages['404']);
        }
    }

    function action_nav() {
        if (status.lockHash) {
            return;
        }

        let hash = ('' + location.hash).replace(/^#/, '');

        $('.header-inner > nav li').removeClass('active');

        if (hash && hash !== 'home') {
            data_setPage(hash);
        } else {
            data_setPage('home');
            utility_clearHash();
        }
    }

    function data_getPage(path, pages) {
        if (!pages) {
            pages = config.pages;
        }

        let pathParts = path.replace(/[?&].*/, '').split('/');

        if (['home', '.'].indexOf(pathParts[0]) > -1) {
            pathParts[0] = '';
        }

        for (let i in pages) {
            if (pages.hasOwnProperty(i) && pages[i].path === pathParts[0]) {
                if (pathParts.length > 1) {
                    if (pages[i].children) {
                        return data_getPage(path.replace(/^[^\/]+\//, ''), pages[i].children);
                    } else {
                        return null;
                    }
                } else {
                    return pages[i];
                }
            }
        }

        return null;
    }

    function data_setPage(path) {
        let page = data_getPage(path);
        $('#nav-page-' + page.root).attr('class', 'active');
        display_page(page);
    }

    /**
     * Returns the given string with the first character in uppercase.
     *
     * @param {string} string
     * @return {string}
     */
    function utility_ucFirst(string) {
        return string.substr(0, 1).toUpperCase() + string.substr(1);
    }

    function utility_camelCase(string) {
        let parts = string.split(/[-\/]/);

        let result = parts.shift();

        // noinspection JSAssignmentUsedAsCondition
        for (let i = 0, part; part = parts[i]; i++) {
            result += utility_ucFirst(part);
        }

        return result;
    }

    function utility_setHash(hash, disallowBackButton, lockHash) {
        let hashWasLocked = !!status.lockHash;
        if (lockHash && !hashWasLocked) {
            status.lockHash = true;
        }

        if (hash === 'home') {
            hash = '';
        }

        let oldHash = '' + location.hash;
        let href = ('' + location.href).replace(/#.*/, '');
        let newHash = typeof hash === 'string' && hash ?
            '#' + hash :
            '';
        href += newHash;

        if (disallowBackButton) {
            if (window.history && window.history.replaceState && location.protocol !== 'file:') {
                window.history.replaceState({}, '', href);
            } else {
                location.replace(newHash || '#.');
            }
        } else {
            if (window.history && window.history.pushState && location.protocol !== 'file:') {
                window.history.pushState({}, '', href);
            } else {
                location.hash = newHash || '#.';
            }
        }

        if (lockHash && !hashWasLocked) {
            setTimeout(function () {
                status.lockHash = false;
            }, 0);
        }

        return oldHash;
    }

    function utility_clearHash(allowBackButton) {
        return utility_setHash(null, !allowBackButton, true);
    }

    // ************************** //
    // ***** INITIALIZATION ***** //
    // ************************** //

    window.addEventListener('DOMContentLoaded', init);
};
