<?php
// =============================================================================
// CALIPE DIGITAL — Controller de Pedidos
// Arquivo: backend/controllers/OrderController.php
// Rotas:
//   GET  /api/orders           → Lista pedidos (admin: todos, cliente: os seus)
//   GET  /api/orders/{id}      → Detalhe do pedido
//   POST /api/orders           → Cria novo pedido (checkout)
//   PUT  /api/orders/{id}/status → Atualiza status [ADMIN]
// =============================================================================

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class OrderController extends BaseController {

    // ── GET /api/orders ───────────────────────────────────────────────────────
    public function index(): void {
        $user = AuthMiddleware::authenticate();
        [$limit, $offset, $page] = $this->getPagination();

        // Admin vê todos os pedidos; cliente vê apenas os seus
        $whereSQL = $user['role'] === 'admin' ? '' : 'WHERE o.user_id = ?';
        $params   = $user['role'] === 'admin' ? [$limit, $offset] : [$user['id'], $limit, $offset];

        $stmt = $this->db->prepare("
            SELECT o.id, o.status, o.total, o.payment_method, o.created_at,
                   u.name AS customer_name, u.email AS customer_email,
                   COUNT(oi.id) AS item_count
            FROM orders o
            INNER JOIN users       u  ON u.id  = o.user_id
            LEFT  JOIN order_items oi ON oi.order_id = o.id
            $whereSQL
            GROUP BY o.id
            ORDER BY o.created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute($params);
        $orders = $stmt->fetchAll();

        // Contagem total
        $countSQL  = "SELECT COUNT(*) FROM orders o $whereSQL";
        $countParams = $user['role'] === 'admin' ? [] : [$user['id']];
        $countStmt = $this->db->prepare($countSQL);
        $countStmt->execute($countParams);
        $total = (int)$countStmt->fetchColumn();

        $this->success([
            'items' => $orders,
            'meta'  => $this->paginationMeta($total, $limit, $page),
        ]);
    }

    // ── GET /api/orders/{id} ──────────────────────────────────────────────────
    public function show(int $id): void {
        $user = AuthMiddleware::authenticate();

        $stmt = $this->db->prepare("
            SELECT o.*, u.name AS customer_name, u.email AS customer_email
            FROM orders o
            INNER JOIN users u ON u.id = o.user_id
            WHERE o.id = ?
        ");
        $stmt->execute([$id]);
        $order = $stmt->fetch();

        if (!$order) $this->error('Pedido não encontrado.', 404);

        // Cliente só pode ver os seus próprios pedidos
        if ($user['role'] !== 'admin' && $order['user_id'] !== $user['id']) {
            $this->error('Acesso negado.', 403);
        }

        // Busca os itens do pedido
        $itemsStmt = $this->db->prepare("
            SELECT oi.quantity, oi.unit_price, oi.total,
                   p.name AS product_name, p.image AS product_image, p.slug AS product_slug
            FROM order_items oi
            INNER JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = ?
        ");
        $itemsStmt->execute([$id]);
        $order['items']       = $itemsStmt->fetchAll();
        $order['address_json'] = json_decode($order['address_json'] ?? '{}', true);

        $this->success($order);
    }

    // ── POST /api/orders (checkout) ───────────────────────────────────────────
    public function store(): void {
        $user = AuthMiddleware::authenticate();
        $data = $this->getBody();
        $this->requireFields($data, ['items', 'address']);

        if (empty($data['items']) || !is_array($data['items'])) {
            $this->error('O carrinho está vazio.', 422);
        }

        // Valida estoque e calcula totais
        $subtotal = 0.0;
        $lineItems = [];

        foreach ($data['items'] as $item) {
            if (empty($item['product_id']) || empty($item['quantity'])) {
                $this->error('Item do carrinho inválido.', 422);
            }

            $stmt = $this->db->prepare(
                'SELECT id, name, price, sale_price, stock FROM products WHERE id = ? AND active = 1'
            );
            $stmt->execute([$item['product_id']]);
            $product = $stmt->fetch();

            if (!$product) $this->error("Produto #{$item['product_id']} não encontrado.", 404);
            if ($product['stock'] < $item['quantity']) {
                $this->error("Estoque insuficiente para '{$product['name']}'.", 422);
            }

            $unitPrice  = (float)($product['sale_price'] ?? $product['price']);
            $lineTotal  = $unitPrice * (int)$item['quantity'];
            $subtotal  += $lineTotal;

            $lineItems[] = [
                'product_id' => $product['id'],
                'quantity'   => (int)$item['quantity'],
                'unit_price' => $unitPrice,
                'total'      => $lineTotal,
            ];
        }

        $shipping = 15.00; // lógica real de frete aqui
        $total    = $subtotal + $shipping;

        // Inicia transação — garante consistência de estoque + pedido
        $this->db->beginTransaction();
        try {
            // Insere o pedido
            $stmt = $this->db->prepare("
                INSERT INTO orders (user_id, status, subtotal, shipping_cost, total, payment_method, address_json)
                VALUES (?, 'pending', ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $user['id'],
                $subtotal,
                $shipping,
                $total,
                $data['payment_method'] ?? 'pix',
                json_encode($data['address']),
            ]);
            $orderId = (int)$this->db->lastInsertId();

            // Insere itens e decrementa estoque
            $insertItem   = $this->db->prepare(
                'INSERT INTO order_items (order_id, product_id, quantity, unit_price, total) VALUES (?,?,?,?,?)'
            );
            $updateStock  = $this->db->prepare(
                'UPDATE products SET stock = stock - ? WHERE id = ?'
            );

            foreach ($lineItems as $li) {
                $insertItem->execute([$orderId, $li['product_id'], $li['quantity'], $li['unit_price'], $li['total']]);
                $updateStock->execute([$li['quantity'], $li['product_id']]);
            }

            $this->db->commit();
            $this->success(['order_id' => $orderId, 'total' => $total], 'Pedido criado com sucesso.', 201);
        } catch (Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    // ── PUT /api/orders/{id}/status [ADMIN] ───────────────────────────────────
    public function updateStatus(int $id): void {
        AuthMiddleware::requireAdmin();
        $data   = $this->getBody();
        $allowed = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!in_array($data['status'] ?? '', $allowed)) {
            $this->error('Status inválido.', 422);
        }

        $stmt = $this->db->prepare('UPDATE orders SET status = ? WHERE id = ?');
        $stmt->execute([$data['status'], $id]);

        if ($stmt->rowCount() === 0) $this->error('Pedido não encontrado.', 404);
        $this->success(null, 'Status atualizado.');
    }
}
