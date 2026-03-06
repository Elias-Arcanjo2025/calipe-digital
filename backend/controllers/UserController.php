<?php
// =============================================================================
// CALIPE DIGITAL — Controller de Utilizadores
// Arquivo: backend/controllers/UserController.php
// =============================================================================

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class UserController extends BaseController {

    // GET /api/users [ADMIN]
    public function index(): void {
        AuthMiddleware::requireAdmin();
        [$limit, $offset, $page] = $this->getPagination();

        $stmt = $this->db->prepare("
            SELECT u.id, u.name, u.email, u.role, u.phone, u.created_at,
                   COUNT(o.id) AS order_count,
                   COALESCE(SUM(o.total), 0) AS total_spent
            FROM users u
            LEFT JOIN orders o ON o.user_id = u.id
            GROUP BY u.id
            ORDER BY u.created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$limit, $offset]);

        $countStmt = $this->db->query('SELECT COUNT(*) FROM users');
        $total     = (int)$countStmt->fetchColumn();

        $this->success([
            'items' => $stmt->fetchAll(),
            'meta'  => $this->paginationMeta($total, $limit, $page),
        ]);
    }

    // GET /api/users/{id}
    public function show(int $id): void {
        $auth = AuthMiddleware::authenticate();
        // Cliente só vê o próprio perfil
        if ($auth['role'] !== 'admin' && $auth['id'] !== $id) {
            $this->error('Acesso negado.', 403);
        }

        $stmt = $this->db->prepare(
            'SELECT id, name, email, role, avatar, phone, created_at FROM users WHERE id = ?'
        );
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        if (!$user) $this->error('Utilizador não encontrado.', 404);
        $this->success($user);
    }

    // PUT /api/users/{id}
    public function update(int $id): void {
        $auth = AuthMiddleware::authenticate();
        if ($auth['role'] !== 'admin' && $auth['id'] !== $id) {
            $this->error('Acesso negado.', 403);
        }

        $data    = $this->getBody();
        $allowed = ['name', 'phone'];
        $sets    = [];
        $params  = [];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $sets[]   = "$field = ?";
                $params[] = htmlspecialchars($data[$field]);
            }
        }

        // Troca de senha
        if (!empty($data['password'])) {
            if (strlen($data['password']) < 8) {
                $this->error('A senha deve ter pelo menos 8 caracteres.', 422);
            }
            $sets[]   = 'password = ?';
            $params[] = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
        }

        if (empty($sets)) $this->error('Nenhum campo para atualizar.', 422);

        $params[] = $id;
        $this->db->prepare('UPDATE users SET ' . implode(', ', $sets) . ' WHERE id = ?')
                 ->execute($params);

        $this->success(null, 'Perfil atualizado com sucesso.');
    }
}
