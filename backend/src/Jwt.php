<?php

declare(strict_types=1);

namespace App;

final class Jwt
{
    public static function encode(array $payload, string $secret): string
    {
        $header = ['alg' => 'HS256', 'typ' => 'JWT'];

        $segments = [
            self::base64UrlEncode(json_encode($header, JSON_THROW_ON_ERROR)),
            self::base64UrlEncode(json_encode($payload, JSON_THROW_ON_ERROR)),
        ];

        $signature = hash_hmac('sha256', implode('.', $segments), $secret, true);
        $segments[] = self::base64UrlEncode($signature);

        return implode('.', $segments);
    }

    public static function decode(string $jwt, string $secret): array
    {
        $parts = explode('.', $jwt);
        if (count($parts) !== 3) {
            throw new ApiException('Could not validate credentials', 401);
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;
        $expected = self::base64UrlEncode(
            hash_hmac('sha256', $encodedHeader . '.' . $encodedPayload, $secret, true)
        );

        if (!hash_equals($expected, $encodedSignature)) {
            throw new ApiException('Could not validate credentials', 401);
        }

        $payload = json_decode(self::base64UrlDecode($encodedPayload), true, 512, JSON_THROW_ON_ERROR);

        if (!is_array($payload) || empty($payload['sub']) || empty($payload['exp'])) {
            throw new ApiException('Could not validate credentials', 401);
        }

        if ((int) $payload['exp'] < time()) {
            throw new ApiException('Could not validate credentials', 401);
        }

        return $payload;
    }

    private static function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $value): string
    {
        $padding = 4 - (strlen($value) % 4);
        if ($padding < 4) {
            $value .= str_repeat('=', $padding);
        }

        $decoded = base64_decode(strtr($value, '-_', '+/'), true);
        if ($decoded === false) {
            throw new ApiException('Could not validate credentials', 401);
        }

        return $decoded;
    }
}
