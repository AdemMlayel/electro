<?php

declare(strict_types=1);

use App\Api;

if (PHP_SAPI === 'cli-server') {
    $requestedPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $file = __DIR__ . $requestedPath;

    if ($requestedPath !== '/' && is_file($file)) {
        return false;
    }
}

[$pdo, $config] = require __DIR__ . '/../src/bootstrap.php';

$api = new Api($pdo, $config);
$api->dispatch();
