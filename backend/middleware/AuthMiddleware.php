<?php
// =============================================================================
// CALIPE DIGITAL — Middleware de Autenticação JWT
// Arquivo: backend/middleware/AuthMiddleware.php
// Descrição: Valida o token JWT enviado no header Authorization.
//            Expõe funções estáticas para proteger rotas e verificar roles.
// =============================================================================

require_once __DIR__ . '/../config/env.php';

class AuthMiddleware {
    /**
     * Verifica o token JWT e retorna o payload decodificado.
     * Lança exceção se o token for inválido ou expirado.
     *
     * @return array Payload do token (id, email, role, etc.)
     * @throws RuntimeException
     */
    public static function authenticate(): array {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        if (!str_starts_with($header, 'Bearer ')) {
            throw new RuntimeException('Token de autenticação ausente.', 401);
        }

        $token = substr($header, 7);
        return self::decodeJWT($token);
    }

    /**
     * Garante que o utilizador autenticado é administrador.
     * @return array Payload do token
     */
    public static function requireAdmin(): array {
        $payload = self::authenticate();
        if ($payload['role'] !== 'admin') {
            throw new RuntimeException('Acesso restrito a administradores.', 403);
        }
        return $payload;
    }

    // ── Geração de Token ──────────────────────────────────────────────────────
    /**
     * Gera um JWT assinado com HMAC-SHA256.
     *
     * @param array $payload Dados a incluir no token (id, email, role)
     * @return string Token JWT completo
     */
    public static function generateJWT(array $payload): string {
        $header  = self::base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload['iat'] = time();
        $payload['exp'] = time() + JWT_EXPIRE;
        $body    = self::base64UrlEncode(json_encode($payload));

        $signature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$body", JWT_SECRET, true)
        );

        return "$header.$body.$signature";
    }

    // ── Decodificação e Validação ─────────────────────────────────────────────
    private static function decodeJWT(string $token): array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new RuntimeException('Token mal formatado.', 401);
        }

        [$header, $body, $sig] = $parts;

        // Recomputa a assinatura e compara (timing-safe)
        $expected = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$body", JWT_SECRET, true)
        );
        if (!hash_equals($expected, $sig)) {
            throw new RuntimeException('Assinatura do token inválida.', 401);
        }

        $payload = json_decode(self::base64UrlDecode($body), true);

        if (!$payload || time() > ($payload['exp'] ?? 0)) {
            throw new RuntimeException('Token expirado. Faça login novamente.', 401);
        }

        return $payload;
    }

    // ── Helpers Base64 URL-safe ───────────────────────────────────────────────
    private static function base64UrlEncode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
