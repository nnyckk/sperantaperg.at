<?php
/**
 * Injects Open Graph tags into articol.html server-side.
 * Social crawlers don't run JS, so they never see the title set by articol.js.
 */

$SITE      = 'https://sperantaperg.at';
$ROOT      = dirname(__DIR__);
$JSON_FILE = __DIR__ . '/stiri.json';
$HTML_FILE = $ROOT . '/articol.html';

$CATEGORII = [
    'anunturi'     => 'Anunțuri',
    'evenimente'   => 'Evenimente',
    'misiuni'      => 'Misiuni',
    'departamente' => 'Departamente',
];

// Defaults, also used when the id is missing or the article doesn't exist.
$ogTitle = 'Articol - Biserica Speranța Perg';
$ogDesc  = 'Noutăți și articole de la Biserica Speranța Perg.';
$ogImage = $SITE . '/assets/icons/sperantaperglogo.webp';
$ogUrl   = $SITE . '/articol.html';
$art     = null;

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

if ($id > 0 && is_file($JSON_FILE)) {
    $articole = json_decode(file_get_contents($JSON_FILE), true);
    if (is_array($articole)) {
        foreach ($articole as $a) {
            if ((int) ($a['id'] ?? 0) === $id) { $art = $a; break; }
        }
    }
}

if ($art) {
    $ogTitle = $art['titlu'] ?? $ogTitle;
    $ogDesc  = $art['rezumat'] ?? $ogDesc;
    $ogUrl   = $SITE . '/articol.html?id=' . $id;
    // og-image.php serves JPEG 1200x630 — WhatsApp won't preview WebP.
    // The mtime param busts the crawler cache when the photo is replaced.
    if (!empty($art['poza'])) {
        $srcPath = $ROOT . '/' . ltrim($art['poza'], '/');
        $stamp   = is_file($srcPath) ? filemtime($srcPath) : 0;
        $ogImage = $SITE . '/stiri/og-image.php?id=' . $id . '&v=' . $stamp;
    }
}

function e($s) {
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

$ogDescClean = trim(preg_replace('/\s+/u', ' ', strip_tags($ogDesc)));
if (function_exists('mb_strimwidth')) {
    $ogDescClean = mb_strimwidth($ogDescClean, 0, 200, '…', 'UTF-8');
}

$pageTitle = $art ? $ogTitle . ' - Biserica Speranța Perg' : $ogTitle;

$meta = "\n"
    . '    <meta name="description" content="' . e($ogDescClean) . '" />' . "\n"
    . '    <link rel="canonical" href="' . e($ogUrl) . '" />' . "\n"
    . '    <meta property="og:type" content="article" />' . "\n"
    . '    <meta property="og:site_name" content="Biserica Speranța Perg" />' . "\n"
    . '    <meta property="og:locale" content="ro_RO" />' . "\n"
    . '    <meta property="og:url" content="' . e($ogUrl) . '" />' . "\n"
    . '    <meta property="og:title" content="' . e($ogTitle) . '" />' . "\n"
    . '    <meta property="og:description" content="' . e($ogDescClean) . '" />' . "\n"
    . '    <meta property="og:image" content="' . e($ogImage) . '" />' . "\n"
    . '    <meta property="og:image:width" content="1200" />' . "\n"
    . '    <meta property="og:image:height" content="630" />' . "\n"
    . '    <meta property="og:image:alt" content="' . e($ogTitle) . '" />' . "\n"
    . '    <meta name="twitter:card" content="summary_large_image" />' . "\n"
    . '    <meta name="twitter:title" content="' . e($ogTitle) . '" />' . "\n"
    . '    <meta name="twitter:description" content="' . e($ogDescClean) . '" />' . "\n"
    . '    <meta name="twitter:image" content="' . e($ogImage) . '" />' . "\n";

if ($art) {
    $meta .= '    <meta property="article:published_time" content="' . e($art['data'] ?? '') . '" />' . "\n"
           . '    <meta property="article:author" content="' . e($art['autor'] ?? '') . '" />' . "\n";
    if (!empty($art['categorie'])) {
        $catLabel = $CATEGORII[$art['categorie']] ?? $art['categorie'];
        $meta .= '    <meta property="article:section" content="' . e($catLabel) . '" />' . "\n";
    }
}

if (!is_file($HTML_FILE)) {
    http_response_code(500);
    header('Content-Type: text/plain; charset=UTF-8');
    echo "Nu gasesc sablonul articol.html\n";
    echo "Cautat la: " . $HTML_FILE . "\n";
    exit;
}

$html = file_get_contents($HTML_FILE);

$html = preg_replace(
    '#<title>.*?</title>#is',
    '<title>' . e($pageTitle) . '</title>' . $meta,
    $html,
    1
);

header('Content-Type: text/html; charset=UTF-8');
echo $html;
