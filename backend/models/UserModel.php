<?php
/**
 * Calipe Digital — Modelo de Utilizadores.
 * Todas as queries usam prepared statements PDO.
 * A senha_hash NUNCA é exposta nas respostas da API.
 */
require_once __DIR__ . '/../config/database.php';

class UserModel {
    private PDO $db;
    public function __construct() { $this->db = Database::getConnection(); }

    /** Busca por email (inclui hash para autenticação) */
    public function findByEmail(string $email): ?array {
        $s = $this->db->prepare(
            'SELECT id, nome, email, senha_hash, role, telefone FROM usuarios WHERE email = ? LIMIT 1'
        );
        $s->execute([$email]);
        return $s->fetch() ?: null;
    }

    /** Busca por ID sem expor hash */
    public function findById(int $id): ?array {
        $s = $this->db->prepare(
            'SELECT id, nome, email, role, telefone, criado_em FROM usuarios WHERE id = ? LIMIT 1'
        );
        $s->execute([$id]);
        return $s->fetch() ?: null;
    }

    /** Regista novo utilizador. Retorna ID. */
    public function create(string $nome, string $email, string $senha, string $role = 'cliente'): int {
        $hash = password_hash($senha, PASSWORD_BCRYPT, ['cost' => 12]);
        $s = $this->db->prepare(
            'INSERT INTO usuarios (nome, email, senha_hash, role) VALUES (?, ?, ?, ?)'
        );
        $s->execute([$nome, $email, $hash, $role]);
        return (int) $this->db->lastInsertId();
    }

    public function emailExists(string $email): bool {
        $s = $this->db->prepare('SELECT 1 FROM usuarios WHERE email = ? LIMIT 1');
        $s->execute([$email]);
        return (bool) $s->fetch();
    }

    /** Lista clientes (admin only) */
    public function listAll(int $limit = 50, int $offset = 0): array {
        $s = $this->db->prepare(
            'SELECT id, nome, email, role, telefone, criado_em
             FROM usuarios ORDER BY criado_em DESC LIMIT ? OFFSET ?'
        );
        $s->execute([$limit, $offset]);
        return $s->fetchAll();
    }

    /** Total de clientes para o dashboard */
    public function countClientes(): int {
        return (int) $this->db->query('SELECT COUNT(*) FROM usuarios WHERE role = "cliente"')->fetchColumn();
    }
}
