<?php

declare(strict_types=1);

namespace App;

use PDO;

final class Database
{
    public static function connect(array $config): PDO
    {
        if (!empty($config['url'])) {
            $parts = parse_url($config['url']);
            if ($parts !== false) {
                $config['host'] = $parts['host'] ?? $config['host'];
                $config['port'] = isset($parts['port']) ? (int) $parts['port'] : $config['port'];
                $config['name'] = isset($parts['path']) ? ltrim($parts['path'], '/') : $config['name'];
                $config['user'] = $parts['user'] ?? $config['user'];
                $config['password'] = $parts['pass'] ?? $config['password'];
            }
        }

        $dsn = sprintf(
            'pgsql:host=%s;port=%d;dbname=%s',
            $config['host'],
            (int) $config['port'],
            $config['name']
        );

        return new PDO($dsn, $config['user'], $config['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_STRINGIFY_FETCHES => false,
        ]);
    }
}
