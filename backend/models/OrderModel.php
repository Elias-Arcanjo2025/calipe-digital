<?php
/**
 * Calipe Digital — Modelo de Pedidos.
 * Gerencia criação, listagem e mudança de status de pedidos.
 * Usa transações PDO para garantir consistência de dados.
 */
require_once __DIR__ . '/../config/database.php';

class OrderModel {
    private PDO $db;
    public function __construct() { $this->db = Database::getConnection(); }

    /**
     * Cria pedido + itens numa transação atómica.
     * Reduz estoque ao confirmar.
     *
     * @param int   $userId     ID do utilizador
     * @param array $items      [{produto_id, quantidade, preco_unit}]
     * @param array $extra      {endereco_id, frete, metodo_pagamento, observacao}
     * @return int              ID do pedido criado
     */
    public function create(int $userId, array $items, array $extra = []): int {
        $this->db->beginTransaction();
        try {
            // Calcula total
            $total = array_sum(array_map(fn($i) => $i['quantidade'] * $i['preco_unit'], $items));
            $total += (float) ($extra['frete'] ?? 0);

            $s = $this->db->prepare(
                "INSERT INTO pedidos (usuario_id, endereco_id, total, frete, metodo_pagamento, observacao)
                 VALUES (?, ?, ?, ?, ?, ?)"
            );
            $s->execute([
                $userId,
                $extra['endereco_id']      ?? null,
                $total,
                $extra['frete']            ?? 0,
                $extra['metodo_pagamento'] ?? null,
                $extra['observacao']       ?? null,
            ]);
            $orderId = (int) $this->db->lastInsertId();

            // Insere itens e decrementa estoque
            $si = $this->db->prepare(
                "INSERT INTO pedido_itens (pedido_id, produto_id, nome_produto, quantidade, preco_unit, subtotal)
                 VALUES (?, ?, ?, ?, ?, ?)"
            );
            $se = $this->db->prepare(
                "UPDATE produtos SET estoque = estoque - ? WHERE id = ? AND estoque >= ?"
            );
            foreach ($items as $item) {
                // Busca nome atual do produto
                $np = $this->db->prepare('SELECT nome FROM produtos WHERE id = ?');
                $np->execute([$item['produto_id']]);
                $nome = $np->fetchColumn() ?: 'Produto';

                $si->execute([
                    $orderId,
                    $item['produto_id'],
                    $nome,
                    $item['quantidade'],
                    $item['preco_unit'],
                    $item['quantidade'] * $item['preco_unit'],
                ]);

                $se->execute([$item['quantidade'], $item['produto_id'], $item['quantidade']]);
                if ($se->rowCount() === 0) {
                    throw new RuntimeException("Estoque insuficiente para produto ID {$item['produto_id']}");
                }
            }

            $this->db->commit();
            return $orderId;
        } catch (Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /** Pedidos de um utilizador específico */
    public function listByUser(int $userId): array {
        $s = $this->db->prepare(
            "SELECT p.id, p.status, p.total, p.frete, p.metodo_pagamento, p.criado_em,
                    COUNT(pi.id) AS qtd_itens
             FROM pedidos p
             LEFT JOIN pedido_itens pi ON pi.pedido_id = p.id
             WHERE p.usuario_id = ?
             GROUP BY p.id
             ORDER BY p.criado_em DESC"
        );
        $s->execute([$userId]);
        return $s->fetchAll();
    }

    /** Detalhe de um pedido com itens */
    public function findById(int $id): ?array {
        $s = $this->db->prepare(
            "SELECT p.*, u.nome AS cliente_nome, u.email AS cliente_email
             FROM pedidos p
             JOIN usuarios u ON u.id = p.usuario_id
             WHERE p.id = ? LIMIT 1"
        );
        $s->execute([$id]);
        $order = $s->fetch();
        if (!$order) return null;

        $si = $this->db->prepare(
            'SELECT pi.*, pr.imagem_principal FROM pedido_itens pi
             LEFT JOIN produtos pr ON pr.id = pi.produto_id
             WHERE pi.pedido_id = ?'
        );
        $si->execute([$id]);
        $order['itens'] = $si->fetchAll();
        return $order;
    }

    /** Lista todos os pedidos para o painel admin */
    public function listAll(int $limit = 30, int $offset = 0, ?string $status = null): array {
        $where  = $status ? 'WHERE p.status = ?' : '';
        $params = $status ? [$status, $limit, $offset] : [$limit, $offset];
        $s = $this->db->prepare(
            "SELECT p.id, p.status, p.total, p.criado_em, u.nome AS cliente, u.email
             FROM pedidos p
             JOIN usuarios u ON u.id = p.usuario_id
             $where
             ORDER BY p.criado_em DESC LIMIT ? OFFSET ?"
        );
        $s->execute($params);
        return $s->fetchAll();
    }

    /** Atualiza status do pedido */
    public function updateStatus(int $id, string $status): bool {
        $valid = ['pendente','pago','preparando','enviado','entregue','cancelado'];
        if (!in_array($status, $valid)) return false;
        return $this->db->prepare('UPDATE pedidos SET status = ? WHERE id = ?')->execute([$status, $id]);
    }

    /** Métricas para o dashboard */
    public function dashboardStats(): array {
        return $this->db->query(
            "SELECT
               COUNT(*) AS total_pedidos,
               SUM(CASE WHEN status NOT IN ('cancelado') THEN total ELSE 0 END) AS receita_total,
               ROUND(AVG(CASE WHEN status NOT IN ('cancelado') THEN total END), 2) AS ticket_medio,
               SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) AS pendentes
             FROM pedidos"
        )->fetch();
    }

    /** Receita por mês (últimos 6 meses) para gráfico */
    public function revenueByMonth(): array {
        return $this->db->query(
            "SELECT DATE_FORMAT(criado_em, '%Y-%m') AS mes,
                    SUM(total) AS receita,
                    COUNT(*) AS pedidos
             FROM pedidos
             WHERE status NOT IN ('cancelado')
               AND criado_em >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
             GROUP BY mes ORDER BY mes"
        )->fetchAll();
    }
}
