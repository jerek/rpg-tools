<?php

namespace RpgTools;

class Words {
    // ********************* //
    // ***** CONSTANTS ***** //
    // ********************* //

    const DEFAULT_WORD_COUNT = 100;

    const NOUNS_MIN_SYLLABLES = 1;
    const NOUNS_MAX_SYLLABLES = 4;

    // ********************* //
    // ***** FUNCTIONS ***** //
    // ********************* //

    // ------ //
    // PUBLIC //
    // ------ //

    /**
     * Display random words in JSON based on the page query.
     *
     * @param array $query
     */
    public static function getRandomWordsAction($query = []) {
        // Check for a requested word type
        $type = null;
        if (!empty($query['type'])) {
            $type = $query['type'];
        }

        // Check for a requested syllable count
        $syllableCount = null;
        if (!empty($query['syllable-count']) && is_numeric($query['syllable-count'])) {
            $syllableCount = $query['syllable-count'];
        }

        // Check for a requested word count
        $wordCount = null;
        if (!empty($query['word-count']) && is_numeric($query['word-count'])) {
            $wordCount = $query['word-count'];
        }

        // Get the random words
        $words = self::getRandomWords($type, $wordCount, $syllableCount);

        // Display it in a JSON page
        \RpgTools::printJsonPage($words);
    }

    // ------- //
    // PRIVATE //
    // ------- //

    /**
     * Get an array of random words.
     *
     * @param string $type
     * @param int    $wordCount
     * @param int    $syllableCount
     * @return array
     * @throws \Exception
     */
    private static function getRandomWords($type, $wordCount = null, $syllableCount = null) {
        // Make sure we have a valid type
        if (!in_array($type, ['adjective', 'adverb', 'noun', 'verb'])) {
            throw new \Exception("\"$type\" is not a valid word type");
        }

        // Make sure we have a valid word count, or null
        if (is_numeric($wordCount) && (string)(int)$wordCount === $wordCount) {
            $wordCount = (int)$wordCount;
        } else {
            $wordCount = null;
        }

        // Make sure we have a valid syllable count, or null
        if (is_numeric($syllableCount) && (string)(int)$syllableCount === $syllableCount) {
            $syllableCount = (int)$syllableCount;
            if ($syllableCount < self::NOUNS_MIN_SYLLABLES) {
                $syllableCount = self::NOUNS_MIN_SYLLABLES;
            }
            if ($syllableCount > self::NOUNS_MAX_SYLLABLES) {
                $syllableCount = self::NOUNS_MAX_SYLLABLES;
            }
        } else {
            $syllableCount = null;
        }

        if ($syllableCount) {
            $filename = $syllableCount . '-syllable';
        } else {
            $filename = 'all';
        }

        return self::getRandomWordsFromFile($type . '/' . $filename, $wordCount);
    }

    /**
     * Get an array of random words from the specified file.
     *
     * @param string $file
     * @param int    $wordCount
     * @return array
     * @throws \Exception
     */
    private static function getRandomWordsFromFile($file, $wordCount = null) {
        $path = 'words/' . $file . '.txt';
        $fullPath = SYS_ROOT . '/' . $path;
        if (!file_exists($fullPath)) {
            throw new \Exception("Word file \"$path\" not found");
        }

        // Attempt to fetch the file
        $file = file($fullPath);
        if (!is_array($file) || empty($file)) {
            throw new \Exception("Word file \"$path\" has no data");
        }

        // Make sure we have a valid word count to look for
        if (!is_int($wordCount)) {
            $wordCount = self::DEFAULT_WORD_COUNT;
        }

        // Don't try to find more words than we have
        $wordCount = min(count($file), $wordCount);

        // Find the random words
        $keys = array_rand($file, $wordCount);
        $words = [];
        foreach ($keys as $key) {
            $words[] = trim($file[$key]);
        }

        // Randomize their order
        shuffle($words);

        return $words;
    }
}
