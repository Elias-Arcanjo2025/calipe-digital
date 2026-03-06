<?php
/**
 * Calipe Digital — Modelo de Categorias.
 * Suporta hierarquia pai/filho para subcategorias.
 */
require_once __DIR__ . '/../config/database.php';

class CategoryModel {
    private PDO $db;
    public function __construct() { $this->db = Database::getConnection(); }

    /** Lista categorias activas com contagem de produtos */
    public function listAll(): array {
        return $this->db->query(
            "SELECT c.id, c.nome, c.slug, c.descricao, c.icone, c.pai_id,
                    COUNT(p.id) AS total_produtos
             FROM categorias c
             LEFT JOIN produtos p ON p.categoria_id = c.id AND p.ativo = 1
             WHERE c.ativo = 1
             GROUP BY c.id
             ORDER BY c.nome"
        )->fetchAll();
    }

    /** Busca categoria por slug */
    public function findBySlug(string $slug): ?array {
        $s = $this->db->prepare('SELECT * FROM categorias WHERE slug = ? AND ativo = 1 LIMIT 1');
        $s->execute([$slug]);
        return $s->fetch() ?: null;
    }

    public function create(array $data): int {
        $s = $this->db->prepare(
            'INSERT INTO categorias (nome, slug, descricao, pai_id, icone) VALUES (?, ?, ?, ?, ?)'
        );
        $slug = trim(preg_replace('/[^a-z0-9]+/', '-', strtolower($data['nome'])), '-');
        $s->execute([$data['nome'], $slug, $data['descricao'] ?? null, $data['pai_id'] ?? null, $data['icone'] ?? null]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $s = $this->db->prepare('UPDATE categorias SET nome = ?, descricao = ?, icone = ? WHERE id = ?');
        return $s->execute([$data['nome'], $data['descricao'] ?? null, $data['icone'] ?? null, $id]);
    }

    public function delete(int $id): bool {
        return $this->db->prepare('UPDATE categorias SET ativo = 0 WHERE id = ?')->execute([$id]);
    }
}
