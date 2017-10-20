<?php

// This is the core Bootstrap for the application.  It sets up autoloading, config, and other services that are needed
// by anything that's going to use this codebase.

// Root of the entire codebase
define("SYS_ROOT", dirname(__DIR__));

// Add the root to the include path
ini_set('include_path', ini_get('include_path') . ':' . SYS_ROOT);

// Load the autoloader
require_once SYS_ROOT . '/vendor/autoload.php';

// Run the bootstrap process
require_once SYS_ROOT . '/library/Bootstrap.php';
\RpgTools\Bootstrap::run();

// Run the application
RpgTools::run();
