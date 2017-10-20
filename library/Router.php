<?php

namespace RpgTools;

/**
 * A simple router.
 *
 * @package RpgTools
 */
class Router {
    // ********************** //
    // ***** PROPERTIES ***** //
    // ********************** //

    /**
     * The user's request.
     *
     * @var string
     */
    private $request = null;

    // ********************* //
    // ***** FUNCTIONS ***** //
    // ********************* //

    // ------ //
    // PUBLIC //
    // ------ //

    /**
     * Router constructor.
     */
    public function __construct() {
        $this->request = $_SERVER['REQUEST_URI'];
    }

    /**
     * Execute on the route.
     */
    public function dispatch() {
        switch(self::getPage()) {
            default:
                echo \RpgTools::renderView('home');
        }
    }

    // ------- //
    // PRIVATE //
    // ------- //

    /**
     * Get the page string, so the router knows where we're going.
     *
     * @return string
     */
    private function getPage() {
        return self::getRequest()[0];
    }

    /**
     * Parse and return the request details.
     *
     * @return array
     */
    private function getRequest() {
        return explode('/', $this->request);
    }
}
