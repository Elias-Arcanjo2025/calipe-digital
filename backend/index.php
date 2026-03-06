<?php
// =============================================================================
// CALIPE DIGITAL — Entry Point do Backend
// Arquivo: backend/index.php
// Descrição: Ponto de entrada único de todas as requisições da API.
//            Configura CORS, headers JSON, tratamento de erros globais
//            e despacha para o roteador principal.
// =============================================================================

require_once __DIR__ . '/config/env.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/routes/api.php';

// ── CORS ──────────────────────────────────────────────────────────────────────
// Permite que o frontend React (porta 5173 em dev) acesse a API
header('Access-Control-Allow-Origin: '  . ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Pre-flight OPTIONS: navegador verifica permissões antes da requisição real
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── Content-Type padrão: JSON ─────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');

// ── Handler global de erros (não vaza stack traces em produção) ───────────────
set_exception_handler(function (Throwable $e) {
    $code    = ($e->getCode() >= 400 && $e->getCode() < 600) ? $e->getCode() : 500;
    $message = DEBUG ? $e->getMessage() : 'Erro interno do servidor.';

    http_response_code($code);
    echo json_encode(['status' => 'error', 'message' => $message, 'data' => null]);
    exit;
});

// ── Roteamento ────────────────────────────────────────────────────────────────
$router = new ApiRouter();
$router->dispatch();
