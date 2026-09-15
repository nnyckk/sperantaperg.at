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
$CACHE_FILE  = __DIR__ . '/cache/youtube.json';
$CACHE_TTL   = 6 * 3600;    // refresh titles/thumbnails every 6h, every day

// Sunday checkpoints (Europe/Vienna): the only extra moments we re-ask the
// API — 9:01 / 18:01 so a starting live shows up, 12:01 / 20:01 so it closes.
// A cache written before the latest passed checkpoint counts as expired.
// Keep in sync with data-service-times in index.html.
$SUNDAY_CHECKPOINTS = ['09:01', '12:01', '18:01', '20:01'];

// Sunday service hours: only inside these can the payload say live=true —
// the live search is skipped (and a cached live flag cleared) outside them.
$SERVICE_WINDOWS = [[9, 12], [18, 20]];

function in_service_window($windows) {
    $tz  = new DateTimeZone('Europe/Vienna');
    $now = new DateTime('now', $tz);
    if ((int)$now->format('w') !== 0) return false; // not Sunday
    $hour = (int)$now->format('G') + (int)$now->format('i') / 60;
    foreach ($windows as $w) {
        if ($hour >= $w[0] && $hour < $w[1]) return true;
    }
    return false;
}

// Timestamp of the most recent checkpoint already passed on the last Sunday
// (0 if none passed yet — then only the plain TTL applies).
function last_sunday_checkpoint($checkpoints) {
    $tz  = new DateTimeZone('Europe/Vienna');
    $now = new DateTime('now', $tz);
    $sunday = clone $now;
    $sunday->modify('-' . (int)$now->format('w') . ' days');
    $best = 0;
    foreach ($checkpoints as $hm) {
        list($h, $m) = explode(':', $hm);
        $t = clone $sunday;
        $t->setTime((int)$h, (int)$m, 0);
        if ($t <= $now && $t->getTimestamp() > $best) $best = $t->getTimestamp();
    }
    return $best;
}

header('Content-Type: application/json; charset=utf-8');
// Short client cache so browsers pick up the checkpoint refreshes; the real
// quota protection is the server-side disk cache below.
header('Cache-Control: public, max-age=60');

$mtime = is_file($CACHE_FILE) ? filemtime($CACHE_FILE) : 0;
$cacheFresh = $mtime
    && (time() - $mtime < $CACHE_TTL)
    && $mtime >= last_sunday_checkpoint($SUNDAY_CHECKPOINTS);

if ($cacheFresh) {
    echo file_get_contents($CACHE_FILE);
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

// Build a search URL for a given eventType (completed | live).
function search_url($channelId, $eventType, $maxResults, $apiKey) {
    return 'https://www.googleapis.com/youtube/v3/search'
        . '?part=snippet'
        . '&channelId=' . urlencode($channelId)
        . '&eventType=' . urlencode($eventType)
        . '&type=video'
        . '&order=date'
        . '&maxResults=' . intval($maxResults)
        . '&key=' . urlencode($apiKey);
}

// Turn a search API item into our video shape.
function map_video($item, $isLive) {
    $sn = $item['snippet'] ?? [];
    $videoId = $item['id']['videoId'] ?? null;
    if (!$videoId) return null;

    $thumbs = $sn['thumbnails'] ?? [];
    $thumb = $thumbs['medium']['url']
        ?? $thumbs['high']['url']
        ?? $thumbs['default']['url']
        ?? '';

    return [
        'id'          => $videoId,
        'title'       => $sn['title'] ?? '',
        'date'        => $sn['publishedAt'] ?? '',
        'thumbnail'   => $thumb,
        // High-res thumbnail for the big player (always available)
        'thumbnail_hi' => 'https://i.ytimg.com/vi/' . $videoId . '/maxresdefault.jpg',
        'url'         => 'https://www.youtube.com/watch?v=' . $videoId,
        'live'        => $isLive,
    ];
}

// 1) Is there a live broadcast running right now? Only worth asking during
//    the Sunday service windows; outside them live is false by definition —
//    the 12:01/20:01 checkpoints close the badge even if the stream runs long.
$liveVideos = [];
if (in_service_window($SERVICE_WINDOWS)) {
    $liveData = http_get_json(search_url($CHANNEL_ID, 'live', 1, $API_KEY));
    if (isset($liveData['items'])) {
        foreach ($liveData['items'] as $item) {
            $v = map_video($item, true);
            if ($v) $liveVideos[] = $v;
        }
    }
}
$isLiveNow = !empty($liveVideos);

// 2) Completed live broadcasts (the "Live" tab), newest first.
//    Excludes shorts and regular uploads.
$searchData = http_get_json(search_url($CHANNEL_ID, 'completed', $MAX_RESULTS, $API_KEY));

if (!isset($searchData['items'])) {
    // API failed (quota exhausted, network error): serve the stale cache so
    // visitors still get the last known list.
    $stale = is_file($CACHE_FILE) ? json_decode(file_get_contents($CACHE_FILE), true) : null;
    if (is_array($stale)) {
        if (in_service_window($SERVICE_WINDOWS)) {
            // During a service window, serve the stale copy WITHOUT rewriting
            // it: the cache stays expired, so the next request retries the
            // API and a transient failure can't kill live detection.
            echo json_encode($stale, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            exit;
        }
        // Outside a window, a cached "live" claim is stale (the broadcast has
        // ended) — clear it so the player leaves live mode.
        if (!empty($stale['live'])) {
            $stale['live'] = false;
            if (is_array($stale['videos'] ?? null)) {
                foreach ($stale['videos'] as &$v) { $v['live'] = false; }
                unset($v);
            }
        }
        // Rewriting the file re-arms the TTL: the failed call is retried once
        // per TTL, not on every page hit.
        $payload = json_encode($stale, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        @file_put_contents($CACHE_FILE, $payload, LOCK_EX);
        echo $payload;
        exit;
    }
    http_response_code(502);
    echo json_encode(['error' => 'Could not fetch live videos.']);
    exit;
}

$completed = [];
foreach ($searchData['items'] as $item) {
    $v = map_video($item, false);
    if ($v) $completed[] = $v;
}

// An active live goes first (becomes the main player with a LIVE tag);
// drop any duplicate of it from the completed list just in case.
$liveIds = array_map(function ($v) { return $v['id']; }, $liveVideos);
$completed = array_values(array_filter($completed, function ($v) use ($liveIds) {
    return !in_array($v['id'], $liveIds, true);
}));
$videos = array_merge($liveVideos, $completed);

$payload = json_encode(
    ['live' => $isLiveNow, 'videos' => $videos],
    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
);

if (!is_dir(dirname($CACHE_FILE))) {
    @mkdir(dirname($CACHE_FILE), 0755, true);
}
@file_put_contents($CACHE_FILE, $payload, LOCK_EX);

echo $payload;
