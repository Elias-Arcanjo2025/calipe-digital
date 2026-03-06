-- ============================================================
--  CALIPE DIGITAL — Esquema do Banco de Dados
--  Versão: 1.0 | Data: 2026-03-06
-- ============================================================

CREATE DATABASE IF NOT EXISTS calipe_digital
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE calipe_digital;

CREATE TABLE IF NOT EXISTS usuarios (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nome          VARCHAR(100)            NOT NULL,
  email         VARCHAR(150)            NOT NULL UNIQUE,
  senha_hash    VARCHAR(255)            NOT NULL,
  role          ENUM('cliente','admin') NOT NULL DEFAULT 'cliente',
  telefone      VARCHAR(20),
  criado_em     DATETIME                NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME                NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role  (role)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS enderecos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT          NOT NULL,
  label       VARCHAR(50)  NOT NULL DEFAULT 'Casa',
  rua         VARCHAR(200) NOT NULL,
  numero      VARCHAR(20)  NOT NULL,
  complemento VARCHAR(100),
  bairro      VARCHAR(100) NOT NULL,
  cidade      VARCHAR(100) NOT NULL,
  estado      CHAR(2)      NOT NULL,
  cep         VARCHAR(10)  NOT NULL,
  principal   TINYINT(1)   NOT NULL DEFAULT 0,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categorias (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  nome      VARCHAR(100) NOT NULL,
  slug      VARCHAR(120) NOT NULL UNIQUE,
  descricao TEXT,
  pai_id    INT          NULL,
  icone     VARCHAR(80),
  ativo     TINYINT(1)   NOT NULL DEFAULT 1,
  FOREIGN KEY (pai_id) REFERENCES categorias(id) ON DELETE SET NULL,
  INDEX idx_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS produtos (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  categoria_id      INT             NULL,
  nome              VARCHAR(200)    NOT NULL,
  slug              VARCHAR(220)    NOT NULL UNIQUE,
  descricao         TEXT,
  preco             DECIMAL(10,2)   NOT NULL,
  preco_promocional DECIMAL(10,2)   NULL,
  estoque           INT             NOT NULL DEFAULT 0,
  sku               VARCHAR(80)     UNIQUE,
  imagem_principal  VARCHAR(255),
  ativo             TINYINT(1)      NOT NULL DEFAULT 1,
  destaque          TINYINT(1)      NOT NULL DEFAULT 0,
  criado_em         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
  INDEX idx_slug      (slug),
  INDEX idx_categoria (categoria_id),
  INDEX idx_ativo     (ativo),
  FULLTEXT INDEX idx_busca (nome, descricao)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS produto_imagens (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  produto_id INT          NOT NULL,
  url        VARCHAR(255) NOT NULL,
  alt        VARCHAR(200),
  ordem      INT          NOT NULL DEFAULT 0,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
  INDEX idx_produto (produto_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pedidos (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id       INT            NOT NULL,
  endereco_id      INT            NULL,
  status           ENUM('pendente','pago','preparando','enviado','entregue','cancelado') NOT NULL DEFAULT 'pendente',
  total            DECIMAL(10,2)  NOT NULL,
  frete            DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  metodo_pagamento VARCHAR(60),
  observacao       TEXT,
  criado_em        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)  ON DELETE RESTRICT,
  FOREIGN KEY (endereco_id) REFERENCES enderecos(id) ON DELETE SET NULL,
  INDEX idx_usuario (usuario_id),
  INDEX idx_status  (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pedido_itens (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id    INT           NOT NULL,
  produto_id   INT           NOT NULL,
  nome_produto VARCHAR(200)  NOT NULL,
  quantidade   INT           NOT NULL,
  preco_unit   DECIMAL(10,2) NOT NULL,
  subtotal     DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (pedido_id)  REFERENCES pedidos(id)  ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE RESTRICT,
  INDEX idx_pedido  (pedido_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reviews (
  id         INT        AUTO_INCREMENT PRIMARY KEY,
  produto_id INT        NOT NULL,
  usuario_id INT        NOT NULL,
  nota       TINYINT    NOT NULL,
  titulo     VARCHAR(150),
  comentario TEXT,
  aprovado   TINYINT(1) NOT NULL DEFAULT 0,
  criado_em  DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE KEY uq_review (produto_id, usuario_id)
) ENGINE=InnoDB;

-- ============================================================
--  SEEDS — Dados Iniciais
--  Admin: admin@calipe.ao | senha: Admin@2026
-- ============================================================
INSERT INTO usuarios (nome, email, senha_hash, role) VALUES
('Admin Calipe', 'admin@calipe.ao',
 '$2y$12$YQr5eN.T6s5BOQlT3dKYme.FwROdHe/2PxmKijbDHqwgWrN/ZoNGa', 'admin');

INSERT INTO categorias (nome, slug, descricao) VALUES
('Electrónica',    'electronica',  'Smartphones, tablets e gadgets'),
('Moda',           'moda',         'Roupas, calçados e acessórios'),
('Casa & Deco',    'casa-deco',    'Decoração, utensílios e móveis'),
('Beleza & Saúde', 'beleza-saude', 'Cosméticos e cuidados pessoais'),
('Desporto',       'desporto',     'Equipamento desportivo');

INSERT INTO produtos (categoria_id, nome, slug, descricao, preco, preco_promocional, estoque, sku, ativo, destaque) VALUES
(1, 'Smartphone X Pro 128GB',    'smartphone-x-pro',        'Ecran AMOLED 6.7", 108MP, 5000mAh',        85000.00, 79000.00, 15, 'EL-001', 1, 1),
(1, 'Auriculares Bluetooth Pro', 'auriculares-bt-pro',      'ANC, 30h autonomia, carga rápida',          12500.00, NULL,     40, 'EL-002', 1, 0),
(2, 'Camisa Linho Premium',      'camisa-linho-premium',    '100% linho natural, slim fit',               4500.00, 3800.00,  60, 'MD-001', 1, 1),
(3, 'Luminária Bamboo Natural',  'luminaria-bamboo',        'Design artesanal, LED 12W incluído',         8900.00, NULL,     25, 'CD-001', 1, 1),
(4, 'Kit Skincare Orgânico',     'kit-skincare-organico',   'Hidratante, sérum e tónico naturais',        6200.00, 5500.00,  35, 'BS-001', 1, 0),
(5, 'Kit Fitness Completo',      'kit-fitness-completo',    'Halteres 10kg + tapete + elásticos',         9800.00, NULL,     20, 'DS-001', 1, 0);
