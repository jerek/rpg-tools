<?php

namespace RpgTools;

/**
 * A handler for rendering views.
 *
 * @package RpgTools
 */
class View {
    // ********************** //
    // ***** PROPERTIES ***** //
    // ********************** //

    /**
     * The name of the template. E.g. 'foo/bar' points to 'templates/views/foo/bar.phtml'.
     *
     * @var string
     */
    private $_template = '';

    // ********************* //
    // ***** FUNCTIONS ***** //
    // ********************* //

    /**
     * View constructor. Dynamically sets everything in $data on $this for easy access within the view template.
     *
     * @param string $template
     * @param array  $data
     */
    public function __construct($template, $data = []) {
        $this->_template = $template;

        foreach ($data as $key => $value) {
            if (!property_exists($this, $key)) {
                $this->{$key} = $value;
            }
        }
    }

    /**
     * Return the rendered view.
     *
     * @return string
     */
    public function render() {
        $file = 'templates/views/' . $this->_template . '.phtml';

        if (!file_exists(SYS_ROOT . '/' . $file)) {
            return "View \"{$file}\" not found!";
        }

        ob_start();
        /** @noinspection PhpIncludeInspection */
        require $file;
        return ob_get_clean();
    }
}
