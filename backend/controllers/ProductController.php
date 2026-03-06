<?php
// =============================================================================
// CALIPE DIGITAL — Controller de Produtos
// Arquivo: backend/controllers/ProductController.php
// Rotas:
//   GET    /api/products           → Lista paginada + filtros
//   GET    /api/products/{id}      → Produto individual
//   POST   /api/products           → Cria produto [ADMIN]
//   PUT    /api/products/{id}      → Atualiza produto [ADMIN]
//   DELETE /api/products/{id}      → Remove produto [ADMIN]
//   GET    /api/products/{id}/reviews → Reviews do produto
// =============================================================================

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ProductController extends BaseController {

    // ── GET /api/products ─────────────────────────────────────────────────────
    public function index(): void {
        [$limit, $offset, $page] = $this->getPagination();

        // ── Filtros via query string ──────────────────────────────────────────
        $where  = ['p.active = 1'];
        $params = [];

        // ?category=slug
        if (!empty($_GET['category'])) {
            $where[]  = 'c.slug = ?';
            $params[] = $_GET['category'];
        }

        // ?search=texto (usa FULLTEXT index)
        if (!empty($_GET['search'])) {
            $where[]  = 'MATCH(p.name, p.description) AGAINST(? IN BOOLEAN MODE)';
            $params[] = $_GET['search'] . '*';
        }

        // ?min_price=0&max_price=1000
        if (!empty($_GET['min_price'])) {
            $where[]  = 'COALESCE(p.sale_price, p.price) >= ?';
            $params[] = (float)$_GET['min_price'];
        }
        if (!empty($_GET['max_price'])) {
            $where[]  = 'COALESCE(p.sale_price, p.price) <= ?';
            $params[] = (float)$_GET['max_price'];
        }

        // ?featured=1
        if (isset($_GET['featured'])) {
            $where[]  = 'p.featured = 1';
        }

        $whereSQL = 'WHERE ' . implode(' AND ', $where);

        // ── Ordenação ─────────────────────────────────────────────────────────
        $allowedSort = ['name', 'price', 'created_at', 'views'];
        $sortBy   = in_array($_GET['sort'] ?? '', $allowedSort) ? $_GET['sort'] : 'created_at';
        $sortDir  = strtoupper($_GET['dir'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';

        // ── Query principal ───────────────────────────────────────────────────
        $sql = "
            SELECT
                p.id, p.name, p.slug, p.price, p.sale_price, p.stock,
                p.image, p.featured, p.views,
                c.name AS category_name, c.slug AS category_slug,
                ROUND(AVG(r.rating), 1) AS avg_rating,
                COUNT(DISTINCT r.id) AS review_count
            FROM products p
            INNER JOIN categories c ON c.id = p.category_id
            LEFT  JOIN reviews    r ON r.product_id = p.id AND r.approved = 1
            $whereSQL
            GROUP BY p.id
            ORDER BY $sortBy $sortDir
            LIMIT ? OFFSET ?
        ";

        $params[] = $limit;
        $params[] = $offset;

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll();

        // ── Contagem total (para paginação) ───────────────────────────────────
        $countParams = array_slice($params, 0, -2); // remove limit/offset
        $countSql    = "SELECT COUNT(DISTINCT p.id) FROM products p
                        INNER JOIN categories c ON c.id = p.category_id
                        $whereSQL";
        $countStmt   = $this->db->prepare($countSql);
        $countStmt->execute($countParams);
        $total = (int)$countStmt->fetchColumn();

        $this->success([
            'items' => $products,
            'meta'  => $this->paginationMeta($total, $limit, $page),
        ]);
    }

    // ── GET /api/products/{id} ────────────────────────────────────────────────
    public function show(int $id): void {
        $stmt = $this->db->prepare("
            SELECT
                p.*,
                c.name AS category_name, c.slug AS category_slug,
                ROUND(AVG(r.rating), 1) AS avg_rating,
                COUNT(DISTINCT r.id) AS review_count
            FROM products p
            INNER JOIN categories c ON c.id = p.category_id
            LEFT  JOIN reviews    r ON r.product_id = p.id AND r.approved = 1
            WHERE p.id = ? AND p.active = 1
            GROUP BY p.id
        ");
        $stmt->execute([$id]);
        $product = $stmt->fetch();

        if (!$product) {
            $this->error('Produto não encontrado.', 404);
        }

        // Incrementa visualizações de forma assíncrona (fire-and-forget)
        $this->db->prepare('UPDATE products SET views = views + 1 WHERE id = ?')->execute([$id]);

        // Decodifica JSON das imagens da galeria
        $product['images'] = json_decode($product['images'] ?? '[]', true);

        $this->success($product);
    }

    // ── POST /api/products (ADMIN) ────────────────────────────────────────────
    public function store(): void {
        AuthMiddleware::requireAdmin();

        $data = $this->getBody();
        $this->requireFields($data, ['name', 'category_id', 'price']);

        $slug = $this->generateSlug($data['name']);

        // Upload de imagem (se enviada via multipart)
        $image = null;
        if (!empty($_FILES['image'])) {
            $image = $this->uploadImage($_FILES['image'], 'product');
        }

        $stmt = $this->db->prepare("
            INSERT INTO products
                (category_id, name, slug, description, price, sale_price, stock, sku, image, featured)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            (int)$data['category_id'],
            htmlspecialchars($data['name']),
            $slug,
            $data['description'] ?? null,
            (float)$data['price'],
            !empty($data['sale_price']) ? (float)$data['sale_price'] : null,
            (int)($data['stock'] ?? 0),
            $data['sku'] ?? null,
            $image,
            (int)($data['featured'] ?? 0),
        ]);

        $this->success(['id' => (int)$this->db->lastInsertId()], 'Produto criado com sucesso.', 201);
    }

    // ── PUT /api/products/{id} (ADMIN) ────────────────────────────────────────
    public function update(int $id): void {
        AuthMiddleware::requireAdmin();

        $data = $this->getBody();

        // Upload nova imagem se enviada
        if (!empty($_FILES['image'])) {
            $data['image'] = $this->uploadImage($_FILES['image'], 'product');
        }

        // Constrói UPDATE dinâmico com apenas os campos enviados
        $allowed = ['name', 'category_id', 'description', 'price', 'sale_price',
                    'stock', 'sku', 'image', 'featured', 'active'];
        $sets    = [];
        $params  = [];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $sets[]   = "$field = ?";
                $params[] = $data[$field];
            }
        }

        if (empty($sets)) {
            $this->error('Nenhum campo para atualizar.', 422);
        }

        $params[] = $id;
        $this->db->prepare('UPDATE products SET ' . implode(', ', $sets) . ' WHERE id = ?')
                 ->execute($params);

        $this->success(null, 'Produto atualizado com sucesso.');
    }

    // ── DELETE /api/products/{id} (ADMIN) ─────────────────────────────────────
    public function destroy(int $id): void {
        AuthMiddleware::requireAdmin();

        // Soft delete — preserva histórico nos pedidos
        $stmt = $this->db->prepare('UPDATE products SET active = 0 WHERE id = ?');
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            $this->error('Produto não encontrado.', 404);
        }

        $this->success(null, 'Produto removido com sucesso.');
    }

    // ── GET /api/products/{id}/reviews ────────────────────────────────────────
    public function getReviews(int $id): void {
        $stmt = $this->db->prepare("
            SELECT r.id, r.rating, r.comment, r.created_at,
                   u.name AS user_name, u.avatar AS user_avatar
            FROM reviews r
            INNER JOIN users u ON u.id = r.user_id
            WHERE r.product_id = ? AND r.approved = 1
            ORDER BY r.created_at DESC
        ");
        $stmt->execute([$id]);
        $this->success($stmt->fetchAll());
    }

    // ── Helper: gera slug único ───────────────────────────────────────────────
    private function generateSlug(string $text): string {
        $slug = mb_strtolower(trim($text));
        $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
        $slug = preg_replace('/[\s-]+/', '-', $slug);

        // Garante unicidade
        $base  = $slug;
        $count = 0;
        do {
            $candidate = $count ? "$base-$count" : $base;
            $stmt = $this->db->prepare('SELECT COUNT(*) FROM products WHERE slug = ?');
            $stmt->execute([$candidate]);
            $exists = (int)$stmt->fetchColumn() > 0;
            $count++;
        } while ($exists);

        return $candidate;
    }
}
