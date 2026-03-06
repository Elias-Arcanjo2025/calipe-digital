<?php
// =============================================================================
// CALIPE DIGITAL — Controller Base
// Arquivo: backend/controllers/BaseController.php
// Descrição: Classe pai com helpers de resposta JSON padronizados e
//            utilitários compartilhados por todos os controllers.
// =============================================================================

require_once __DIR__ . '/../config/database.php';

abstract class BaseController
{
    /** Instância PDO compartilhada */
    protected PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    // ── Respostas Padronizadas ─────────────────────────────────────────────────

    /** Resposta de sucesso (2xx) */
    protected function success(mixed $data = null, string $message = 'Operação realizada com sucesso.', int $code = 200): never
    {
        http_response_code($code);
        echo json_encode([
            'status' => 'success',
            'message' => $message,
            'data' => $data,
        ]);
        exit;
    }

    /** Resposta de erro (4xx / 5xx) */
    protected function error(string $message, int $code = 400, mixed $data = null): never
    {
        http_response_code($code);
        echo json_encode([
            'status' => 'error',
            'message' => $message,
            'data' => $data,
        ]);
        exit;
    }

    // ── Entrada ───────────────────────────────────────────────────────────────

    /**
     * Lê e decodifica o corpo da requisição JSON.
     * @return array Dados do body ou array vazio
     */
    protected function getBody(): array
    {
        $raw = file_get_contents('php://input');
        return json_decode($raw, true) ?? [];
    }

    /**
     * Valida se os campos obrigatórios estão presentes no array de dados.
     * @param array $data   Dados recebidos
     * @param array $fields Campos obrigatórios
     */
    protected function requireFields(array $data, array $fields): void
    {
        foreach ($fields as $field) {
            if (empty($data[$field])) {
                $this->error("O campo '{$field}' é obrigatório.", 422);
            }
        }
    }

    // ── Upload de Imagens ─────────────────────────────────────────────────────

    /**
     * Faz upload de uma imagem para /uploads/.
     * Aceita: jpg, jpeg, png, webp. Tamanho máx: 5 MB.
     *
     * @param array  $file    $_FILES['campo']
     * @param string $prefix  Prefixo do nome de arquivo gerado
     * @return string Nome do arquivo salvo
     */
    protected function uploadImage(array $file, string $prefix = 'img'): string
    {
        $allowed = ['image/jpeg', 'image/png', 'image/webp'];
        $maxSize = 5 * 1024 * 1024; // 5 MB

        if ($file['error'] !== UPLOAD_ERR_OK) {
            $this->error('Erro no upload da imagem.', 422);
        }
        if (!in_array($file['type'], $allowed)) {
            $this->error('Formato de imagem não suportado. Use JPG, PNG ou WEBP.', 422);
        }
        if ($file['size'] > $maxSize) {
            $this->error('Imagem muito grande. Limite: 5 MB.', 422);
        }

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = $prefix . '_' . uniqid() . '.' . strtolower($ext);
        $dest = UPLOADS_PATH . $filename;

        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            $this->error('Não foi possível salvar a imagem.', 500);
        }

        return $filename;
    }

    // ── Paginação ─────────────────────────────────────────────────────────────

    /** Retorna [limit, offset] baseado nos query params ?page=&per_page= */
    protected function getPagination(): array
    {
        $page = max(1, (int)($_GET['page'] ?? 1));
        $perPage = min(100, max(1, (int)($_GET['per_page'] ?? 20)));
        $offset = ($page - 1) * $perPage;
        return [$perPage, $offset, $page];
    }

    /** Gera o bloco de meta-dados de paginação */
    protected function paginationMeta(int $total, int $perPage, int $page): array
    {
        return [
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => (int)ceil($total / $perPage),
        ];
    }
}
