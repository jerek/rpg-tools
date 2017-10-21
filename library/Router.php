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
     * The path requested by the user.
     *
     * @var array|null
     */
    private $path = null;

    /**
     * The parsed array of any query string on the request, or null.
     *
     * @var array|null
     */
    private $query = null;

    /**
     * Any query string on the request, or null.
     *
     * @var string|null
     */
    private $queryString = null;

    /**
     * The user's request.
     *
     * @var string
     */
    private $requestString = null;

    // ********************* //
    // ***** FUNCTIONS ***** //
    // ********************* //

    // ------ //
    // PUBLIC //
    // ------ //

    /**
     * Parse the request URI and store the results.
     */
    public function __construct() {
        // Store the base request
        $this->requestString = urldecode($_SERVER['REQUEST_URI']);

        // Store the full query string
        $this->queryString = urldecode($_SERVER['QUERY_STRING']);

        // Prepare a request path string without the leading slash
        $requestPath = preg_replace('~^/~', '', $this->requestString);

        if (is_string($this->queryString)) {
            // Parse the query string and store it as an array
            parse_str($this->queryString, $this->query);

            // Remove the query string from the request
            $needle = '?' . $this->queryString;
            if (($pos = strpos($requestPath, $needle)) !== false) {
                $requestPath = substr($requestPath, 0, $pos);
            }
        }

        // Store an array of the request path
        $this->path = explode('/', $requestPath);
    }

    /**
     * Execute on the route.
     */
    public function dispatch() {
        $request = $this->getRequest();

        switch ($request['path'][0]) {
            case 'get-nouns':
                Words::getRandomNounsAction($request['query']);
                break;
            case '':
                // Root page
                echo \RpgTools::renderView('home');
                break;
            default:
                // 404
                echo \RpgTools::renderView('404');
        }
    }

    // ------- //
    // PRIVATE //
    // ------- //

    /**
     * Parse and return the request details.
     *
     * @return array
     */
    private function getRequest() {
        return [
            'path' => $this->path,
            'query' => $this->query,
        ];
    }
}
