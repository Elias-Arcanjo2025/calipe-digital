<?php
/**
 * Calipe Digital — JWT HS256 sem dependências externas.
 * Em produção: defina JWT_SECRET via variável de ambiente.
 */
define('JWT_SECRET', 'calipe_secret_2026_MUDE_EM_PRODUCAO');
define('JWT_EXPIRATION', 86400); // 24h

class JWT {
    public static function generate(array $payload): string {
        $header  = self::b64u(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload['iat'] = time();
        $payload['exp'] = time() + JWT_EXPIRATION;
        $body    = self::b64u(json_encode($payload));
        $sig     = self::b64u(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
        return "$header.$body.$sig";
    }

    public static function validate(string $token): ?array {
        $p = explode('.', $token);
        if (count($p) !== 3) return null;
        [$h, $b, $s] = $p;
        if (!hash_equals(self::b64u(hash_hmac('sha256', "$h.$b", JWT_SECRET, true)), $s)) return null;
        $payload = json_decode(self::b64uDec($b), true);
        if (!$payload || $payload['exp'] < time()) return null;
        return $payload;
    }

    private static function b64u(string $d): string { return rtrim(strtr(base64_encode($d), '+/', '-_'), '='); }
    private static function b64uDec(string $d): string { return base64_decode(strtr($d, '-_', '+/')); }
}
