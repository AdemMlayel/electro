<?php

declare(strict_types=1);

spl_autoload_register(static function (string $class): void {
    $prefix = 'App\\';
    if (!str_starts_with($class, $prefix)) {
        return;
    }

    $relative = substr($class, strlen($prefix));
    $path = __DIR__ . '/' . str_replace('\\', '/', $relative) . '.php';

    if (is_file($path)) {
        require $path;
    }
});
$config = [
    'db' => [
        'url' => getenv('DATABASE_URL') ?: null,
        'host' => getenv('DB_HOST') ?: 'db',
        'port' => (int) (getenv('DB_PORT') ?: 5432),
        'name' => getenv('DB_NAME') ?: 'electro_repair',
        'user' => getenv('DB_USER') ?: 'postgres',
        'password' => getenv('DB_PASSWORD') ?: '',
    ],
    'auth' => [
        'secret_key' => getenv('SECRET_KEY') ?: 'CHANGE_ME_SUPER_SECRET_KEY',
        'algorithm' => getenv('JWT_ALGORITHM') ?: 'HS256',
        'access_token_expire_minutes' => (int) (getenv('ACCESS_TOKEN_EXPIRE_MINUTES') ?: 60),
    ],
    'cors' => array_values(array_filter(array_map(
        static fn (string $origin): string => trim($origin),
        explode(',', getenv('CORS_ORIGINS') ?: 'http://localhost:3000')
    ))),
    'storage' => [
        'path' => rtrim(
            getenv('LOCAL_STORAGE_PATH') ?: (dirname(__DIR__) . '/public/uploads'),
            "/\\"
        ),
    ],
];

$pdo = App\Database::connect($config['db']);
App\Schema::ensure($pdo);

return [$pdo, $config];
