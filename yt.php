<?php
$apiKey = "AIzaSyCHixSbSmfuX3D6tLJO99S2EwpMUFUHXwk";
$cacheFile = "cache.json";
$cacheTime = 3600;

$cache = file_exists($cacheFile) ? json_decode(file_get_contents($cacheFile), true) : [];

if (!isset($_GET["q"])) {
    echo json_encode(["error" => "Missing search query"]);
    exit;
}

$q = $_GET["q"];

if (isset($cache[$q]) && (time() - $cache[$q]["time"] < $cacheTime)) {
    header("Content-Type: application/json");
    echo json_encode($cache[$q]["data"]);
    exit;
}

$url = "https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=20&q="
        . urlencode($q)
        . "&key=" . $apiKey;

$response = file_get_contents($url);
$data = json_decode($response, true);

if (isset($data["items"])) {
    $cache[$q] = [
        "time" => time(),
        "data" => $data
    ];
    file_put_contents($cacheFile, json_encode($cache));
}

header("Content-Type: application/json");
echo json_encode($data);
?>