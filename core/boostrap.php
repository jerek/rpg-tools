<?php

// This is the core Bootstrap for the application.  It sets up autoloading, config, and other services that are needed
// by anything that's going to use this codebase.

// Root of the entire codebase
define("SYS_ROOT", dirname(__DIR__));

// Load the autoloader
require_once SYS_ROOT . '/vendor/autoload.php';

// Run the bootstrap process
require_once SYS_ROOT . '/library/Bootstrap.php';
\RpgTools\Bootstrap::run();
