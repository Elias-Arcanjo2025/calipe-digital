<?php
/**
 * Calipe Digital — Middleware de Autenticação JWT.
 * Encerra o request com 401/403 se token inválido.
 */
require_once __DIR__ . '/../config/jwt.php';

class AuthMiddleware {
    /** Requer token válido. Retorna payload. */
    public static function require(): array {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (!str_starts_with($header, 'Bearer ')) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Token não fornecido.']);
            exit;
        }
        $payload = JWT::validate(substr($header, 7));
        if (!$payload) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Token inválido ou expirado.']);
            exit;
        }
        return $payload;
    }

    /** Requer token válido E role admin. */
    public static function requireAdmin(): array {
        $payload = self::require();
        if (($payload['role'] ?? '') !== 'admin') {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Acesso restrito a administradores.']);
            exit;
        }
        return $payload;
    }
}
