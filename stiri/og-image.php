<?php
/**
 * Serves article covers as JPEG 1200x630 for social previews.
 * Sources are WebP 5333x3000, which WhatsApp won't preview and Facebook
 * would downscale badly. Converted once, then cached on disk.
 */

$OG_W      = 1200;
$OG_H      = 630;
$QUALITY   = 82;
$ROOT      = dirname(__DIR__);
$CACHE_DIR = __DIR__ . '/og-cache';
$JSON_FILE = __DIR__ . '/stiri.json';

// Fall back to the logo so a preview never ends up imageless.
function fallback_and_exit() {
    $logo = dirname(__DIR__) . '/assets/icons/sperantaperglogo.webp';
    if (is_file($logo)) {
        header('Content-Type: image/webp');
        readfile($logo);
    } else {
        http_response_code(404);
    }
    exit;
}

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
if ($id <= 0 || !is_file($JSON_FILE)) fallback_and_exit();

$articole = json_decode(file_get_contents($JSON_FILE), true);
if (!is_array($articole)) fallback_and_exit();

$art = null;
foreach ($articole as $a) {
    if ((int) ($a['id'] ?? 0) === $id) { $art = $a; break; }
}
if (!$art || empty($art['poza'])) fallback_and_exit();

$rel = ltrim(str_replace('\\', '/', $art['poza']), '/');
if (strpos($rel, '..') !== false) fallback_and_exit();
$src = $ROOT . '/' . $rel;
if (!is_file($src)) fallback_and_exit();

// mtime in the filename invalidates the cache when the photo is replaced.
$cacheFile = $CACHE_DIR . '/' . $id . '-' . filemtime($src) . '.jpg';

if (is_file($cacheFile)) {
    header('Content-Type: image/jpeg');
    header('Cache-Control: public, max-age=31536000, immutable');
    readfile($cacheFile);
    exit;
}

$ext = strtolower(pathinfo($src, PATHINFO_EXTENSION));
switch ($ext) {
    case 'webp': $imgIn = @imagecreatefromwebp($src); break;
    case 'jpg':
    case 'jpeg': $imgIn = @imagecreatefromjpeg($src); break;
    case 'png':  $imgIn = @imagecreatefrompng($src);  break;
    default:     $imgIn = false;
}
if (!$imgIn) fallback_and_exit();

$srcW = imagesx($imgIn);
$srcH = imagesy($imgIn);

// Cover crop: fill 1200x630 keeping the aspect ratio, trim the overflow.
$scale = max($OG_W / $srcW, $OG_H / $srcH);
$cropW = (int) round($OG_W / $scale);
$cropH = (int) round($OG_H / $scale);
$cropX = (int) round(($srcW - $cropW) / 2);
$cropY = (int) round(($srcH - $cropH) / 2);

$out = imagecreatetruecolor($OG_W, $OG_H);
imagecopyresampled($out, $imgIn, 0, 0, $cropX, $cropY, $OG_W, $OG_H, $cropW, $cropH);
imagedestroy($imgIn);

if (!is_dir($CACHE_DIR)) @mkdir($CACHE_DIR, 0755, true);
@imagejpeg($out, $cacheFile, $QUALITY);

header('Content-Type: image/jpeg');
header('Cache-Control: public, max-age=31536000, immutable');
imagejpeg($out, null, $QUALITY);
imagedestroy($out);
