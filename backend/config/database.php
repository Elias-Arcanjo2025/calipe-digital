<?php
/**
 * Calipe Digital — Configuração da Base de Dados
 * PDO com prepared statements, modo exception e utf8mb4.
 */
class Database {
    private string $host     = 'localhost';
    private string $dbname   = 'calipe_digital';
    private string $username = 'root';
    private string $password = '';
    private string $charset  = 'utf8mb4';
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $db = new self();
            self::$instance = $db->connect();
        }
        return self::$instance;
    }

    private function connect(): PDO {
        $dsn = "mysql:host={$this->host};dbname={$this->dbname};charset={$this->charset}";
        try {
            return new PDO($dsn, $this->username, $this->password, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Erro de conexão com a base de dados.']);
            exit;
        }
    }
}
