var LocalStorage = new function () {
    var status = {
        supported: null,
    };

    try {
        status.supported = 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        status.supported = false;
    }

    if (status.supported) {
        try {
            localStorage.setItem('test', '123');
            status.supported = localStorage.getItem('test') == '123';
            localStorage.removeItem('test');
        } catch (e) {
            status.supported = false;
        }
    }

    this.supported = function () {
        return status.supported;
    };

    this.set = function (key, value) {
        if (!status.supported) {
            return;
        }

        localStorage.setItem(key, JSON.stringify(value));
    };

    this.get = function (key) {
        if (!status.supported) {
            return;
        }

        return JSON.parse(localStorage.getItem(key));
    };

    this.remove = function (key) {
        if (!status.supported) {
            return;
        }

        localStorage.removeItem(key);
    };
};
