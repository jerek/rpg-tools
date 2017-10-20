<?php

namespace RpgTools;

/**
 * Bootstrap handles setting up our PHP environment: autoloading, environment, and config.
 */
class Bootstrap {
    // ------ //
    // PUBLIC //
    // ------ //

    /**
     * Run the bootstrap process.
     */
    public static function run() {
        self::initLoader();
    }

    // ------- //
    // PRIVATE //
    // ------- //

    /**
     * Set up autoloading.
     */
    private static function initLoader() {
        $Loader = new \Composer\Autoload\ClassLoader();

        // The \RpgTools namespace is rooted at library/. So the class "\RpgTools\Foo" would be in library/Foo.php, and
        // have "namespace RpgTools" and "class Foo" in it.
        $Loader->addPsr4('RpgTools\\', SYS_ROOT . '/library');

        $Loader->addClassMap([
            // Class RpgTools is not in the RpgTools namespace, it's in the root namespace, because it's used for quick
            // access.
            'RpgTools' => SYS_ROOT . '/library/RpgTools.php',
        ]);

        $Loader->register();
    }
}
