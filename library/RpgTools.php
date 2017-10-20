<?php

use RpgTools\View;
use RpgTools\Router;

/**
 * A general controller and namespace root.
 */
class RpgTools {
    // ********************** //
    // ***** PROPERTIES ***** //
    // ********************** //

    /**
     * The instance of the router.
     *
     * @var RpgTools\Router
     */
    private static $router = null;

    // ********************* //
    // ***** FUNCTIONS ***** //
    // ********************* //

    /**
     * Run the application.
     */
    public static function run() {
        self::$router = new Router();
        self::$router->dispatch();
    }

    /**
     * Shortcut to return a rendered view.
     *
     * @param string $view
     * @param array  $data
     * @return string
     */
    public static function renderView($view, $data = []) {
        return (new View($view, $data))->render();
    }
}
