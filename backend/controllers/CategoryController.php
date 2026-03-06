<?php
// =============================================================================
// CALIPE DIGITAL — Controller de Categorias
// Arquivo: backend/controllers/CategoryController.php
// =============================================================================

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class CategoryController extends BaseController {

    // GET /api/categories
    public function index(): void {
        $stmt = $this->db->query("
            SELECT c.id, c.name, c.slug, c.description, c.image,
                   COUNT(p.id) AS product_count
            FROM categories c
            LEFT JOIN products p ON p.category_id = c.id AND p.active = 1
            WHERE c.active = 1
            GROUP BY c.id
            ORDER BY c.name ASC
        ");
        $this->success($stmt->fetchAll());
    }

    // GET /api/categories/{id}
    public function show(int $id): void {
        $stmt = $this->db->prepare(
            'SELECT * FROM categories WHERE id = ? AND active = 1'
        );
        $stmt->execute([$id]);
        $cat = $stmt->fetch();

        if (!$cat) $this->error('Categoria não encontrada.', 404);
        $this->success($cat);
    }

    // POST /api/categories [ADMIN]
    public function store(): void {
        AuthMiddleware::requireAdmin();
        $data = $this->getBody();
        $this->requireFields($data, ['name']);

        $slug = mb_strtolower(preg_replace('/[^a-zA-Z0-9]/', '-', $data['name']));

        $stmt = $this->db->prepare(
            'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)'
        );
        $stmt->execute([
            htmlspecialchars($data['name']),
            $slug,
            $data['description'] ?? null,
        ]);

        $this->success(['id' => (int)$this->db->lastInsertId()], 'Categoria criada.', 201);
    }

    // PUT /api/categories/{id} [ADMIN]
    public function update(int $id): void {
        AuthMiddleware::requireAdmin();
        $data = $this->getBody();

        $stmt = $this->db->prepare(
            'UPDATE categories SET name = ?, description = ?, active = ? WHERE id = ?'
        );
        $stmt->execute([
            $data['name']        ?? null,
            $data['description'] ?? null,
            $data['active']      ?? 1,
            $id,
        ]);
        $this->success(null, 'Categoria atualizada.');
    }

    // DELETE /api/categories/{id} [ADMIN]
    public function destroy(int $id): void {
        AuthMiddleware::requireAdmin();
        $this->db->prepare('UPDATE categories SET active = 0 WHERE id = ?')->execute([$id]);
        $this->success(null, 'Categoria removida.');
    }
}
