<?php
/**
 * EXEMPLU de configurare pentru proxy-ul YouTube.
 *
 * Cum folosesti:
 *  1. Copiaza acest fisier ca "config.local.php" (in acelasi folder api/).
 *  2. Completeaza cheia si channel ID-ul reale in config.local.php.
 *  3. config.local.php e in .gitignore, deci cheia NU ajunge in Git.
 *
 * Acest fisier (config.example.php) NU contine secrete si poate fi comis.
 */

return [
    // Cheia din Google Cloud (YouTube Data API v3).
    'api_key'    => 'PUNE_CHEIA_AICI',

    // ID-ul canalului, forma "UC...".
    'channel_id' => 'PUNE_CHANNEL_ID_AICI',
];
