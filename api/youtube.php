<?php
/**
 * YouTube Data API proxy for the sermons section.
 * Keeps the API key server-side and caches the result on disk.
 * Config (key + channel id) lives in api/config.local.php (gitignored).
 */

$configFile = __DIR__ . '/config.local.php';
$cfg = is_file($configFile) ? require $configFile : [];
$API_KEY    = $cfg['api_key']    ?? 'PUNE_CHEIA_AICI';
$CHANNEL_ID = $cfg['channel_id'] ?? 'PUNE_CHANNEL_ID_AICI';

$MAX_RESULTS = 11;          // 1 player + 10 carousel
$CACHE_TTL   = 6 * 3600;    // 6 hours
$CACHE_FILE  = __DIR__ . '/cache/youtube.json';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=' . $CACHE_TTL);

// Serve fresh cache
if (is_file($CACHE_FILE) && (time() - filemtime($CACHE_FILE) < $CACHE_TTL)) {
    readfile($CACHE_FILE);
    exit;
}

if ($API_KEY === 'PUNE_CHEIA_AICI' || $CHANNEL_ID === 'PUNE_CHANNEL_ID_AICI') {
    http_response_code(500);
    echo json_encode(['error' => 'Not configured: set api_key and channel_id in api/config.local.php']);
    exit;
}

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
    $ctx  = stream_context_create(['http' => ['timeout' => 10]]);
    $body = @file_get_contents($url, false, $ctx);
    if ($body === false) return null;
    return json_decode($body, true);
}

// Fetch only completed live broadcasts (the "Live" tab), newest first.
// This excludes shorts and regular uploads.
$searchUrl = 'https://www.googleapis.com/youtube/v3/search'
    . '?part=snippet'
    . '&channelId=' . urlencode($CHANNEL_ID)
    . '&eventType=completed'
    . '&type=video'
    . '&order=date'
    . '&maxResults=' . intval($MAX_RESULTS)
    . '&key=' . urlencode($API_KEY);

$searchData = http_get_json($searchUrl);

if (!isset($searchData['items'])) {
    http_response_code(502);
    echo json_encode(['error' => 'Could not fetch live videos.']);
    exit;
}

$videos = [];
foreach ($searchData['items'] as $item) {
    $sn = $item['snippet'] ?? [];
    $videoId = $item['id']['videoId'] ?? null;
    if (!$videoId) continue;

    $thumbs = $sn['thumbnails'] ?? [];
    $thumb = $thumbs['medium']['url']
        ?? $thumbs['high']['url']
        ?? $thumbs['default']['url']
        ?? '';

    $videos[] = [
        'id'          => $videoId,
        'title'       => $sn['title'] ?? '',
        'date'        => $sn['publishedAt'] ?? '',
        'thumbnail'   => $thumb,
        // High-res thumbnail for the big player (always available)
        'thumbnail_hi' => 'https://i.ytimg.com/vi/' . $videoId . '/maxresdefault.jpg',
        'url'         => 'https://www.youtube.com/watch?v=' . $videoId,
    ];
}

$payload = json_encode(['videos' => $videos], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

if (!is_dir(dirname($CACHE_FILE))) {
    @mkdir(dirname($CACHE_FILE), 0755, true);
}
@file_put_contents($CACHE_FILE, $payload, LOCK_EX);

echo $payload;
