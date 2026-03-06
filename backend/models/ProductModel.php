<?php
/**
 * Calipe Digital — Modelo de Produtos.
 * Queries optimizadas: sem SELECT *, índices explorados,
 * FULLTEXT para Smart Search, filtros dinâmicos seguros.
 */
require_once __DIR__ . '/../config/database.php';

class ProductModel {
    private PDO $db;
    public function __construct() { $this->db = Database::getConnection(); }

    /**
     * Lista produtos com filtros dinâmicos.
     * @param array $filters  Chaves: categoria, preco_max, destaque, limit, offset
     */
    public function list(array $filters = []): array {
        $where  = ['p.ativo = 1'];
        $params = [];

        if (!empty($filters['categoria'])) {
            $where[]  = 'c.slug = ?';
            $params[] = $filters['categoria'];
        }
        if (!empty($filters['preco_max'])) {
            $where[]  = 'p.preco <= ?';
            $params[] = (float) $filters['preco_max'];
        }
        if (!empty($filters['destaque'])) {
            $where[] = 'p.destaque = 1';
        }

        $limit  = min((int) ($filters['limit']  ?? 20), 100);
        $offset = (int) ($filters['offset'] ?? 0);
        $params[] = $limit;
        $params[] = $offset;

        $stmt = $this->db->prepare(
            "SELECT p.id, p.nome, p.slug, p.preco, p.preco_promocional,
                    p.estoque, p.imagem_principal, p.destaque,
                    c.nome AS categoria, c.slug AS categoria_slug
             FROM produtos p
             LEFT JOIN categorias c ON c.id = p.categoria_id
             WHERE " . implode(' AND ', $where) . "
             ORDER BY p.destaque DESC, p.criado_em DESC
             LIMIT ? OFFSET ?"
        );
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /** Smart Search fulltext */
    public function search(string $query): array {
        $stmt = $this->db->prepare(
            "SELECT p.id, p.nome, p.slug, p.preco, p.preco_promocional, p.imagem_principal
             FROM produtos p
             WHERE p.ativo = 1
               AND MATCH(p.nome, p.descricao) AGAINST(? IN BOOLEAN MODE)
             LIMIT 10"
        );
        $stmt->execute([$query . '*']);
        return $stmt->fetchAll();
    }

    /** Detalhe completo por slug (com galeria e reviews) */
    public function findBySlug(string $slug): ?array {
        $stmt = $this->db->prepare(
            "SELECT p.*, c.nome AS categoria, c.slug AS categoria_slug
             FROM produtos p
             LEFT JOIN categorias c ON c.id = p.categoria_id
             WHERE p.slug = ? AND p.ativo = 1 LIMIT 1"
        );
        $stmt->execute([$slug]);
        $product = $stmt->fetch();
        if (!$product) return null;

        // Galeria de imagens
        $imgs = $this->db->prepare(
            'SELECT url, alt FROM produto_imagens WHERE produto_id = ? ORDER BY ordem'
        );
        $imgs->execute([$product['id']]);
        $product['galeria'] = $imgs->fetchAll();

        // Estatísticas de reviews
        $rev = $this->db->prepare(
            'SELECT ROUND(AVG(nota),1) AS media, COUNT(*) AS total
             FROM reviews WHERE produto_id = ? AND aprovado = 1'
        );
        $rev->execute([$product['id']]);
        $product['reviews_stats'] = $rev->fetch();

        return $product;
    }

    /** Cria produto e retorna ID */
    public function create(array $data): int {
        $stmt = $this->db->prepare(
            "INSERT INTO produtos
             (categoria_id, nome, slug, descricao, preco, preco_promocional,
              estoque, sku, imagem_principal, ativo, destaque)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $data['categoria_id']    ?? null,
            $data['nome'],
            $this->makeSlug($data['nome']),
            $data['descricao']       ?? null,
            $data['preco'],
            $data['preco_promocional'] ?? null,
            $data['estoque']         ?? 0,
            $data['sku']             ?? null,
            $data['imagem_principal']?? null,
            $data['ativo']           ?? 1,
            $data['destaque']        ?? 0,
        ]);
        return (int) $this->db->lastInsertId();
    }

    /** Actualiza campos permitidos de um produto */
    public function update(int $id, array $data): bool {
        $allowed = ['nome','descricao','preco','preco_promocional','estoque',
                    'sku','imagem_principal','ativo','destaque','categoria_id'];
        $fields = $params = [];
        foreach ($allowed as $f) {
            if (array_key_exists($f, $data)) {
                $fields[] = "$f = ?";
                $params[] = $data[$f];
            }
        }
        if (empty($fields)) return false;
        $params[] = $id;
        return $this->db->prepare("UPDATE produtos SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);
    }

    /** Soft-delete: desactiva em vez de apagar */
    public function delete(int $id): bool {
        return $this->db->prepare('UPDATE produtos SET ativo = 0 WHERE id = ?')->execute([$id]);
    }

    /** Estatísticas para dashboard */
    public function stats(): array {
        return $this->db->query(
            'SELECT COUNT(*) AS total,
                    SUM(CASE WHEN estoque = 0 THEN 1 ELSE 0 END) AS sem_estoque,
                    SUM(CASE WHEN estoque < 5 AND estoque > 0 THEN 1 ELSE 0 END) AS estoque_baixo
             FROM produtos WHERE ativo = 1'
        )->fetch();
    }

    /** Slug único a partir do nome */
    private function makeSlug(string $name): string {
        $slug = trim(preg_replace('/[^a-z0-9]+/', '-', strtolower($name)), '-');
        $check = $this->db->prepare('SELECT COUNT(*) FROM produtos WHERE slug = ?');
        $check->execute([$slug]);
        if (!$check->fetchColumn()) return $slug;
        for ($i = 2; ; $i++) {
            $check->execute(["$slug-$i"]);
            if (!$check->fetchColumn()) return "$slug-$i";
        }
    }
}
