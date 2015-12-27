var Base = new function() {
    var config = {
        pages: {
            '404': {
                name: 'Page Not Found',
                path: '404',
                root: null
            },
            character: {
                name: 'Character',
                path: 'character',
                root: 'character'
            },
            dice: {
                name: 'Dice',
                path: 'dice',
                root: 'dice'
            },
            home: {
                name: 'Home',
                path: '',
                root: 'home'
            },
            initiative: {
                name: 'Initiative',
                path: 'initiative',
                root: 'initiative'
            },
            watches: {
                name: 'Watches',
                path: 'watches',
                root: 'watches'
            }
        },
        nav: [
            'home',
            'dice',
            'character',
            'initiative',
            'watches'
        ],
        systems: {
            deciv: {
                id: 'deciv',
                name: 'Deciv',
                'class': 'Deciv'
            }
        }
    };
    var elements = {};
    var status = {
        lockHash: false
    };

    this.init = function() {
        elements.wrapper = utility_addElement('wrapper', document.body);
        elements.header = utility_addElement('header', elements.wrapper);
        elements.body = utility_addElement('body', elements.wrapper);

        display_header(elements.header);

        $(window).on('hashchange', action_nav);
        action_nav();
    };

    this.addElement = function(name, target, options) {
        return utility_addElement(name, target, options);
    };

    /**
     * @param {string} systemId
     * @returns {object|null}
     */
    this.getSystemClass = function(systemId) {
        if (config.systems[systemId]) {
            return window['System_' + config.systems[systemId]['class']];
        }

        return null;
    };

    /**
     * @param {string} systemId
     * @returns {object|null}
     */
    this.getSystemInfo = function(systemId) {
        return config.systems[systemId] || null;
    };

    /**
     * @returns {object}
     */
    this.getSystems = function() {
        return config.systems;
    };

    this.returnFalse = function () {
        return false;
    };

    this.roll = function(sides) {
        return Math.floor((Math.random() * sides) + 1);
    };

    this.error = function(message, consoleOnly) {
        if (consoleOnly) {
            if (typeof console != 'undefined' && console && typeof console.error == 'function') {
                console.error(message);
            }
        } else {
            alert(message);
        }
    };

    function display_header(target) {
        elements.headerInner = utility_addElement('header-inner', target);
        elements.logo = utility_addElement('logo', elements.headerInner);
        elements.nav = utility_addElement('nav', elements.headerInner, 'nav');
        elements.navInner = utility_addElement('nav-inner', elements.nav, 'ul');

        display_navigation(elements.navInner);
    }

    function display_navigation(target) {
        target.empty();
        for (var i = 0, navKey; navKey = config.nav[i]; i++) {
            display_navigationItem(target, config.pages[navKey]);
        }
    }

    function display_navigationItem(target, navItem) {
        var li = utility_addElement(null, target, {
            element: 'li',
            id: 'nav-page-' + navItem.root
        });
        var a = utility_addElement(null, li, {
            element: 'a',
            href: '#' + navItem.path
        });
        a.html(navItem.name);
    }

    function display_page(pageObject) {
        $(document.body).attr('data-page', pageObject.path || pageObject.root);
        var pageClassName = utility_ucFirst(utility_camelCase(pageObject.path || 'home'));
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

        var hash = ('' + location.hash).replace(/^#/, '');

        $('.header-inner > nav li').removeClass('active');

        if (hash && hash != 'home') {
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

        var pathParts = path.replace(/[?&].*/, '').split('/');

        if (['home', '.'].indexOf(pathParts[0]) > -1) {
            pathParts[0] = '';
        }

        for (var i in pages) {
            if (pages.hasOwnProperty(i) && pages[i].path == pathParts[0]) {
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
        var page = data_getPage(path);
        $('#nav-page-' + page.root).attr('class', 'active');
        display_page(page);
    }

    function utility_addElement(name, target, options) {
        switch (typeof options) {
            case 'string':
                options = {
                    element: options
                };
                break;
            case 'object':
                // do nothing
                break;
            default:
                options = {};
        }

        if (!options['class']) {
            options['class'] = name;
        }

        var nodeType = 'div';
        if (options.element) {
            nodeType = options.element;
            delete options.element;
        }

        var prepend = !!options.prepend;
        delete options.prepend;

        var element = $('<' + nodeType + '/>', options);

        if (target) {
            if (prepend) {
                element.prependTo(target);
            } else {
                element.appendTo(target);
            }
        }

        return element;
    }

    function utility_ucFirst(string) {
        return string.substr(0, 1).toUpperCase() + string.substr(1);
    }

    function utility_camelCase(string) {
        var parts = string.split(/[-\/]/);

        var result = parts.shift();

        for (var i = 0, part; part = parts[i]; i++) {
            result += utility_ucFirst(part);
        }

        return result;
    }

    function utility_hyphenate(string) {
        var parts = string.split(/[-\/]/);

        var result = parts.shift();

        return result.join('-');
    }

    function utility_setHash(hash, disallowBackButton, lockHash) {
        var hashWasLocked = !!status.lockHash;
        if (lockHash && !hashWasLocked) {
            status.lockHash = true;
        }

        if (hash == 'home') {
            hash = '';
        }

        var oldHash = '' + location.hash;
        var href = ('' + location.href).replace(/#.*/, '');
        var newHash = typeof hash == 'string' && hash ?
            '#' + hash :
            '';
        href += newHash;

        if (disallowBackButton) {
            if (window.history && window.history.replaceState && location.protocol != 'file:') {
                window.history.replaceState({}, '', href);
            } else {
                location.replace(newHash || '#.');
            }
        } else {
            if (window.history && window.history.pushState && location.protocol != 'file:') {
                window.history.pushState({}, '', href);
            } else {
                location.hash = newHash || '#.';
            }
        }

        if (lockHash && !hashWasLocked) {
            setTimeout(function() {
                status.lockHash = false;
            }, 0);
        }

        return oldHash;
    }

    function utility_clearHash(allowBackButton) {
        return utility_setHash(null, !allowBackButton, true);
    }
};

$(Base.init);
