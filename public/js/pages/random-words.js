var Page_RandomWords = new function () {
    // ********************* //
    // ***** CONSTANTS ***** //
    // ********************* //

    var config = {
        defaults: {
            type: 'noun',
            wordCount: 100,
            syllableCount: '',
        },
        maximums: {
            wordCount: 1000,
            syllableCount: 4,
        },
        minimums: {
            wordCount: 1,
            syllableCount: 1,
        },
        values: {
            type: [
                'noun',
                'adjective',
                'verb',
                'adverb',
            ],
        },
    };

    // ********************* //
    // ***** VARIABLES ***** //
    // ********************* //

    var elements = {
        formElements: {},
    };

    var lastResult = null;

    // ********************* //
    // ***** FUNCTIONS ***** //
    // ********************* //

    // ------ //
    // PUBLIC //
    // ------ //

    this.init = function (target) {
        elements.container = target;

        display_heading();
        display_form();
        display_body();

        if (lastResult) {
            display_words(lastResult);
        }
    };

    // ------- //
    // PRIVATE //
    // ------- //

    function display_heading() {
        elements.heading && elements.heading.remove && elements.heading.remove();

        elements.heading = Utility.addElement('random-words-heading', elements.container, {
            element: 'h1',
            text: 'Random Words',
        });
    }

    function display_form() {
        elements.form && elements.form.remove && elements.form.remove();

        elements.form = Utility.addElement('random-words-form', elements.container, {
            element: 'form',
            name: 'random-words-form',
            submit: function (event) {
                var params = {};
                if (document.forms['random-words-form']['type'].value) {
                    var type = document.forms['random-words-form']['type'].value;
                    if (config.values.type.indexOf(type) >= 0) {
                        params['type'] = type;
                    } else {
                        document.forms['random-words-form']['type'].value = config.defaults.type;
                    }
                }
                if (document.forms['random-words-form']['word-count'].value) {
                    var wordCount = parseInt(document.forms['random-words-form']['word-count'].value);
                    if (wordCount < config.minimums.wordCount) {
                        wordCount = config.minimums.wordCount;
                    }
                    if (wordCount > config.maximums.wordCount) {
                        wordCount = config.maximums.wordCount;
                    }
                    if (!isNaN(wordCount)) {
                        params['word-count'] = wordCount;
                        document.forms['random-words-form']['word-count'].value = wordCount;
                    } else {
                        document.forms['random-words-form']['word-count'].value = config.defaults.wordCount;
                    }
                }
                if (document.forms['random-words-form']['syllable-count'].value) {
                    var syllableCount = parseInt(document.forms['random-words-form']['syllable-count'].value);
                    if (syllableCount < config.minimums.syllableCount) {
                        syllableCount = config.minimums.syllableCount;
                    }
                    if (syllableCount > config.maximums.syllableCount) {
                        syllableCount = config.maximums.syllableCount;
                    }
                    if (!isNaN(syllableCount)) {
                        params['syllable-count'] = syllableCount;
                        document.forms['random-words-form']['syllable-count'].value = syllableCount;
                    } else {
                        document.forms['random-words-form']['syllable-count'].value = config.defaults.syllableCount;
                    }
                }
                $.getJSON('/get-random-words', params, display_words);
                return false;
            },
        });

        // Type
        elements.formElements.typeLabel = Utility.addElement('random-words-form-type-label', elements.form, {
            element: 'label',
            to: 'type',
            text: 'Type: ',
        });
        elements.formElements.type = Utility.addElement('random-words-form-type', elements.formElements.typeLabel, {
            element: 'select',
            name: 'type',
            type: 'text',
        });
        for (var i = 0, type; type = config.values.type[i]; i++) {
            Utility.addElement('random-words-form-type-option', elements.formElements.type, {
                element: 'option',
                value: type,
                text: type.substr(0, 1).toUpperCase() + type.substr(1),
            });
        }

        // Word Count
        elements.formElements.wordCountLabel = Utility.addElement('random-words-form-word-count-label', elements.form, {
            element: 'label',
            to: 'word-count',
            text: 'Word Count: ',
        });
        elements.formElements.wordCount = Utility.addElement('random-words-form-word-count', elements.formElements.wordCountLabel, {
            element: 'input',
            name: 'word-count',
            type: 'text',
            value: config.defaults.wordCount,
        });

        // Syllable Count
        elements.formElements.syllableCountLabel = Utility.addElement('random-words-form-syllable-count-label', elements.form, {
            element: 'label',
            to: 'syllable-count',
            text: 'Syllable Count: ',
        });
        elements.formElements.syllableCount = Utility.addElement('random-words-form-syllable-count', elements.formElements.syllableCountLabel, {
            element: 'select',
            name: 'syllable-count',
            type: 'text',
        });
        var syllableCounts = [
            ['', 'Any'],
            [1, 1],
            [2, 2],
            [3, 3],
            [4, 4],
        ];
        for (var j = 0, syllableCount; syllableCount = syllableCounts[j]; j++) {
            Utility.addElement('random-words-form-syllable-count-option', elements.formElements.syllableCount, {
                element: 'option',
                value: syllableCount[0],
                text: syllableCount[1],
            });
        }

        // Submit button
        elements.formElements.submit = Utility.addElement('random-words-form-submit', elements.form, {
            element: 'button',
            type: 'submit',
            text: 'Display',
        });
    }

    function display_body() {
        elements.body && elements.body.remove && elements.body.remove();

        elements.body = Utility.addElement('random-words-body', elements.container, {
            element: 'body',
        });
    }

    function display_words(words) {
        if (words instanceof Array) {
            elements.body.empty();
            for (var i = 0, word; word = words[i]; i++) {
                Utility.addElement('random-words-word', elements.body, {
                    element: 'div',
                    text: word,
                });
            }
            lastResult = words;
        }
    }
};
