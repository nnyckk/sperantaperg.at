<?php
/**
 * Proxy YouTube Data API pentru sectiunea de predici.
 *
 * De ce exista acest fisier:
 *  - Site-ul e static, deci o cheie API pusa in JS ar fi vizibila oricui.
 *  - Aici cheia sta pe server (invizibila in browser). Browserul cheama
 *    doar acest fisier, care intreaba YouTube si returneaza JSON curat.
 *  - Rezultatul e pus in cache pe disc 6 ore, ca sa nu consumam cota API
 *    la fiecare vizita.
 *
 * CONFIGURARE:
 *  Cheia si channel ID stau in fisierul separat api/config.local.php,
 *  care e in .gitignore (nu ajunge in Git). Copiaza config.example.php
 *  in config.local.php si completeaza acolo. Vezi config.example.php.
 */

// ─────────────────────────────────────────────
//  Configurare (din fisier local, tinut in afara Git-ului)
// ─────────────────────────────────────────────
$configFile = __DIR__ . '/config.local.php';
if (is_file($configFile)) {
    $cfg = require $configFile;
} else {
    $cfg = [];
}
$API_KEY    = $cfg['api_key']    ?? 'PUNE_CHEIA_AICI';
$CHANNEL_ID = $cfg['channel_id'] ?? 'PUNE_CHANNEL_ID_AICI';

$MAX_RESULTS   = 11;            // ultima predica (player) + 10 in carusel
$CACHE_TTL     = 6 * 3600;      // 6 ore, in secunde
$CACHE_FILE    = __DIR__ . '/cache/youtube.json';

// ─────────────────────────────────────────────
//  Antet raspuns
// ─────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
// Permite doar same-origin in mod normal; ajusteaza daca ai nevoie.
header('Cache-Control: public, max-age=' . $CACHE_TTL);

// ─────────────────────────────────────────────
//  1. Serveste din cache daca e proaspat
// ─────────────────────────────────────────────
if (is_file($CACHE_FILE) && (time() - filemtime($CACHE_FILE) < $CACHE_TTL)) {
    readfile($CACHE_FILE);
    exit;
}

// ─────────────────────────────────────────────
//  2. Verifica configurarea
// ─────────────────────────────────────────────
if ($API_KEY === 'PUNE_CHEIA_AICI' || $CHANNEL_ID === 'PUNE_CHANNEL_ID_AICI') {
    http_response_code(500);
    echo json_encode(['error' => 'Neconfigurat: completeaza API_KEY si CHANNEL_ID in api/youtube.php']);
    exit;
}

// ─────────────────────────────────────────────
//  Helper: apel HTTP GET (cURL cu fallback)
// ─────────────────────────────────────────────
function http_get_json($url) {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 10,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $body = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($body === false || $code >= 400) return null;
        return json_decode($body, true);
    }
    // Fallback fara cURL
    $ctx  = stream_context_create(['http' => ['timeout' => 10]]);
    $body = @file_get_contents($url, false, $ctx);
    if ($body === false) return null;
    return json_decode($body, true);
}

// ─────────────────────────────────────────────
//  3. Ia lista de uploads a canalului
//     (fara "search" — costa mai putina cota si e mai fiabil)
// ─────────────────────────────────────────────
$channelUrl = 'https://www.googleapis.com/youtube/v3/channels'
    . '?part=contentDetails'
    . '&id=' . urlencode($CHANNEL_ID)
    . '&key=' . urlencode($API_KEY);

$channelData = http_get_json($channelUrl);
$uploadsId = $channelData['items'][0]['contentDetails']['relatedPlaylists']['uploads'] ?? null;

if (!$uploadsId) {
    http_response_code(502);
    echo json_encode(['error' => 'Nu am putut obtine playlist-ul de uploads. Verifica CHANNEL_ID si cheia.']);
    exit;
}

// ─────────────────────────────────────────────
//  4. Ia ultimele videoclipuri din playlist-ul de uploads
// ─────────────────────────────────────────────
$playlistUrl = 'https://www.googleapis.com/youtube/v3/playlistItems'
    . '?part=snippet'
    . '&playlistId=' . urlencode($uploadsId)
    . '&maxResults=' . intval($MAX_RESULTS)
    . '&key=' . urlencode($API_KEY);

$playlistData = http_get_json($playlistUrl);

if (!isset($playlistData['items'])) {
    http_response_code(502);
    echo json_encode(['error' => 'Nu am putut obtine videoclipurile.']);
    exit;
}

// ─────────────────────────────────────────────
//  5. Formateaza raspunsul: doar ce ne trebuie
// ─────────────────────────────────────────────
$videos = [];
foreach ($playlistData['items'] as $item) {
    $sn = $item['snippet'] ?? [];
    $videoId = $sn['resourceId']['videoId'] ?? null;
    if (!$videoId) continue;

    // Alege cel mai bun thumbnail disponibil.
    $thumbs = $sn['thumbnails'] ?? [];
    $thumb = $thumbs['medium']['url']
        ?? $thumbs['high']['url']
        ?? $thumbs['default']['url']
        ?? '';

    $videos[] = [
        'id'        => $videoId,
        'title'     => $sn['title'] ?? '',
        'date'      => $sn['publishedAt'] ?? '',
        'thumbnail' => $thumb,
        'url'       => 'https://www.youtube.com/watch?v=' . $videoId,
    ];
}

$payload = json_encode(['videos' => $videos], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

// ─────────────────────────────────────────────
//  6. Scrie in cache si trimite
// ─────────────────────────────────────────────
if (!is_dir(dirname($CACHE_FILE))) {
    @mkdir(dirname($CACHE_FILE), 0755, true);
}
@file_put_contents($CACHE_FILE, $payload, LOCK_EX);

echo $payload;
