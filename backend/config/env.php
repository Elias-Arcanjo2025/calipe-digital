<?php
// =============================================================================
// CALIPE DIGITAL — Configuração de Ambiente
// Arquivo: backend/config/env.php
// Descrição: Centraliza todas as variáveis de ambiente do sistema.
//            Em produção, substitua os valores por variáveis reais do servidor.
// =============================================================================

// ── Carregar .env manualmente (simples, sem composer) ───────────────────────
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0)
            continue;
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'calipe_digital');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_CHARSET', 'utf8mb4');

// JWT — Chave secreta para assinar os tokens de autenticação
// ATENÇÃO: Troque por uma string aleatória longa em produção!
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'calipe_digital_super_secret_key_2026!');
define('JWT_EXPIRE', 60 * 60 * 24 * 7); // 7 dias em segundos

// Paths
define('ROOT_PATH', dirname(__DIR__));
define('UPLOADS_PATH', ROOT_PATH . '/uploads/');
define('UPLOADS_URL', getenv('UPLOADS_URL') ?: 'http://localhost/calipe-digital/backend/uploads/');

// CORS — Origem permitida (frontend React em dev)
define('ALLOWED_ORIGIN', getenv('FRONTEND_URL') ?: 'http://localhost:5173');

// Ambiente (development | production)
define('APP_ENV', getenv('APP_ENV') ?: 'development');
define('DEBUG', APP_ENV === 'development');
