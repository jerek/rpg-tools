var Page_RandomWords = new function() {
    var elements = {
        formElements: {},
    };
    var defaults = {
        wordCount: 100,
        syllableCount: 0,
    };
    var lastResult = null;

    this.init = function(target) {
        elements.container = target;

        display_heading();
        display_form();
        display_body();

        if (lastResult) {
            display_words(lastResult);
        }
    };

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
            submit: function(event) {
                var url = '/get-nouns';
                var params = {};
                if (document.forms['random-words-form']['word-count'].value) {
                    var wordCount = parseInt(document.forms['random-words-form']['word-count'].value);
                    if (!isNaN(wordCount)) {
                        params['word-count'] = wordCount;
                    }
                }
                if (document.forms['random-words-form']['syllable-count'].value) {
                    var syllableCount = parseInt(document.forms['random-words-form']['syllable-count'].value);
                    if (!isNaN(syllableCount)) {
                        params['syllable-count'] = syllableCount;
                    }
                }
                $.getJSON(url, params, display_words);
                return false;
            },
        });

        elements.formElements.wordCountLabel = Utility.addElement('random-words-form-word-count-label', elements.form, {
            element: 'label',
            to: 'word-count',
            text: 'Word Count: ',
        });

        elements.formElements.wordCount = Utility.addElement('random-words-form-word-count', elements.formElements.wordCountLabel, {
            element: 'input',
            name: 'word-count',
            type: 'text',
            value: defaults.wordCount,
        });

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
        for (var i = 0, syllableCount; syllableCount = syllableCounts[i]; i++) {
            Utility.addElement('random-words-form-syllable-count-option', elements.formElements.syllableCount, {
                element: 'option',
                value: syllableCount[0],
                text: syllableCount[1],
            });
        }

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
