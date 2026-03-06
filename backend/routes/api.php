<?php
// =============================================================================
// CALIPE DIGITAL — Roteador da API REST
// Arquivo: backend/routes/api.php
// Descrição: Mapeia URI + método HTTP para o controller e action corretos.
//            Padrão de URL: /api/{recurso}/{id?}/{sub-recurso?}
// =============================================================================

require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/ProductController.php';
require_once __DIR__ . '/../controllers/CategoryController.php';
require_once __DIR__ . '/../controllers/OrderController.php';
require_once __DIR__ . '/../controllers/UserController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ApiRouter
{
    /** URI relativa (ex: /api/products/5) */
    private string $uri;
    /** Método HTTP (GET, POST, PUT, DELETE) */
    private string $method;
    /** Segmentos da URI separados por "/" */
    private array $segments;

    public function __construct()
    {
        // Obter o caminho base do script (ex: /calipe-digital/backend)
        $basePath = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
        // Obter a URI completa da requisição
        $requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        // Remover o caminho base e o prefixo "api" se existirem
        $path = str_replace($basePath, '', $requestUri);
        $this->uri = trim($path, '/');

        // Remover "api" se for o primeiro segmento
        $this->segments = explode('/', $this->uri);
        if (($this->segments[0] ?? '') === 'api') {
            array_shift($this->segments);
            $this->uri = implode('/', $this->segments);
        }

        $this->method = $_SERVER['REQUEST_METHOD'];
    }

    /**
     * Despacha a requisição para o controller adequado.
     * Estrutura esperada da URL: api/{resource}/{id}/{sub}
     */
    public function dispatch(): void
    {
        $resource = $this->segments[0] ?? '';
        $id = $this->segments[1] ?? null;
        $sub = $this->segments[2] ?? null;

        match ($resource) {
                'auth' => $this->handleAuth($id),
                'products' => $this->handleProducts($id, $sub),
                'categories' => $this->handleCategories($id),
                'orders' => $this->handleOrders($id, $sub),
                'users' => $this->handleUsers($id),
                default => $this->notFound(),
            };
    }

    // ── AUTH (/api/auth/register | /api/auth/login | /api/auth/me) ────────────
    private function handleAuth(?string $action): void
    {
        $controller = new AuthController();
        match ([$this->method, $action]) {
            ['POST', 'register'] => $controller->register(),
            ['POST', 'login'] => $controller->login(),
            ['GET', 'me'] => $controller->me(),
            ['POST', 'logout'] => $controller->logout(),
                default => $this->notFound(),
            };
    }

    // ── PRODUCTS (/api/products | /api/products/{id}) ─────────────────────────
    private function handleProducts(?string $id, ?string $sub): void
    {
        $controller = new ProductController();

        if ($sub === 'reviews') {
            // GET /api/products/{id}/reviews
            $controller->getReviews((int)$id);
            return;
        }

        match ([$this->method, $id !== null]) {
            ['GET', false] => $controller->index(),
            ['GET', true] => $controller->show((int)$id),
            ['POST', false] => $controller->store(), // admin
            ['PUT', true] => $controller->update((int)$id), // admin
            ['DELETE', true] => $controller->destroy((int)$id), // admin
                default => $this->notFound(),
            };
    }

    // ── CATEGORIES (/api/categories | /api/categories/{id}) ──────────────────
    private function handleCategories(?string $id): void
    {
        $controller = new CategoryController();
        match ([$this->method, $id !== null]) {
            ['GET', false] => $controller->index(),
            ['GET', true] => $controller->show((int)$id),
            ['POST', false] => $controller->store(),
            ['PUT', true] => $controller->update((int)$id),
            ['DELETE', true] => $controller->destroy((int)$id),
                default => $this->notFound(),
            };
    }

    // ── ORDERS (/api/orders | /api/orders/{id}) ───────────────────────────────
    private function handleOrders(?string $id, ?string $sub): void
    {
        $controller = new OrderController();

        if ($sub === 'status') {
            // PUT /api/orders/{id}/status (admin)
            $controller->updateStatus((int)$id);
            return;
        }

        match ([$this->method, $id !== null]) {
            ['GET', false] => $controller->index(),
            ['GET', true] => $controller->show((int)$id),
            ['POST', false] => $controller->store(),
                default => $this->notFound(),
            };
    }

    // ── USERS (/api/users | /api/users/{id}) ──────────────────────────────────
    private function handleUsers(?string $id): void
    {
        $controller = new UserController();
        match ([$this->method, $id !== null]) {
            ['GET', false] => $controller->index(), // admin
            ['GET', true] => $controller->show((int)$id),
            ['PUT', true] => $controller->update((int)$id),
                default => $this->notFound(),
            };
    }

    /** Resposta 404 padronizada */
    private function notFound(): void
    {
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'message' => 'Endpoint não encontrado.',
            'data' => null,
        ]);
        exit;
    }
}
