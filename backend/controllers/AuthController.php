<?php
// =============================================================================
// CALIPE DIGITAL — Controller de Autenticação
// Arquivo: backend/controllers/AuthController.php
// Rotas:
//   POST /api/auth/register  → Cria conta de cliente
//   POST /api/auth/login     → Retorna JWT
//   GET  /api/auth/me        → Dados do utilizador logado
//   POST /api/auth/logout    → (stateless JWT — apenas sinalização ao front)
// =============================================================================

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AuthController extends BaseController {

    // ── POST /api/auth/register ───────────────────────────────────────────────
    public function register(): void {
        $data = $this->getBody();
        $this->requireFields($data, ['name', 'email', 'password']);

        // Sanitização básica
        $name     = htmlspecialchars(trim($data['name']));
        $email    = filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL);
        $password = $data['password'];

        // Validações
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('E-mail inválido.', 422);
        }
        if (strlen($password) < 8) {
            $this->error('A senha deve ter pelo menos 8 caracteres.', 422);
        }

        // Verifica e-mail duplicado
        $stmt = $this->db->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            $this->error('Este e-mail já está cadastrado.', 409);
        }

        // Hash seguro da senha com bcrypt (custo 12)
        $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

        $stmt = $this->db->prepare(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([$name, $email, $hash, 'customer']);
        $userId = (int)$this->db->lastInsertId();

        $token = AuthMiddleware::generateJWT([
            'id'    => $userId,
            'email' => $email,
            'role'  => 'customer',
        ]);

        $this->success(
            ['token' => $token, 'user' => ['id' => $userId, 'name' => $name, 'email' => $email, 'role' => 'customer']],
            'Conta criada com sucesso.',
            201
        );
    }

    // ── POST /api/auth/login ──────────────────────────────────────────────────
    public function login(): void {
        $data = $this->getBody();
        $this->requireFields($data, ['email', 'password']);

        $email    = filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL);
        $password = $data['password'];

        // Busca o utilizador pelo e-mail (sem SELECT *)
        $stmt = $this->db->prepare(
            'SELECT id, name, email, password, role FROM users WHERE email = ? LIMIT 1'
        );
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        // Mensagem genérica para não revelar se o e-mail existe
        if (!$user || !password_verify($password, $user['password'])) {
            $this->error('Credenciais inválidas.', 401);
        }

        $token = AuthMiddleware::generateJWT([
            'id'    => $user['id'],
            'email' => $user['email'],
            'role'  => $user['role'],
        ]);

        unset($user['password']); // nunca enviar o hash ao cliente
        $this->success(['token' => $token, 'user' => $user], 'Login realizado com sucesso.');
    }

    // ── GET /api/auth/me ──────────────────────────────────────────────────────
    public function me(): void {
        $payload = AuthMiddleware::authenticate();

        $stmt = $this->db->prepare(
            'SELECT id, name, email, role, avatar, phone, created_at FROM users WHERE id = ?'
        );
        $stmt->execute([$payload['id']]);
        $user = $stmt->fetch();

        if (!$user) {
            $this->error('Utilizador não encontrado.', 404);
        }

        $this->success($user);
    }

    // ── POST /api/auth/logout ─────────────────────────────────────────────────
    // JWT é stateless — o logout real é feito no frontend apagando o token.
    // Este endpoint apenas confirma a ação para o cliente.
    public function logout(): void {
        AuthMiddleware::authenticate(); // valida que está logado
        $this->success(null, 'Logout realizado. Até breve!');
    }
}
