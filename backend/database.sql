-- ============================================================
--  CALIPE DIGITAL — Database Schema (Fixed for Controllers)
--  Version: 1.1 | Date: 2026-03-06
--  Description: Updated to match English-named controllers.
-- ============================================================

CREATE DATABASE IF NOT EXISTS calipe_digital
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE calipe_digital;

-- ── USERS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)            NOT NULL,
  email         VARCHAR(150)            NOT NULL UNIQUE,
  password      VARCHAR(255)            NOT NULL,
  role          ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  avatar        VARCHAR(100)            DEFAULT NULL,
  phone         VARCHAR(20)             DEFAULT NULL,
  created_at    DATETIME                NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME                NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role  (role)
) ENGINE=InnoDB;

-- ── CATEGORIES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  image       VARCHAR(255) DEFAULT NULL,
  active      TINYINT(1)   NOT NULL DEFAULT 1,
  INDEX idx_slug (slug)
) ENGINE=InnoDB;

-- ── PRODUCTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  category_id   INT             NULL,
  name          VARCHAR(200)    NOT NULL,
  slug          VARCHAR(220)    NOT NULL UNIQUE,
  description   TEXT,
  price         DECIMAL(10,2)   NOT NULL,
  sale_price    DECIMAL(10,2)   NULL,
  stock         INT             NOT NULL DEFAULT 0,
  sku           VARCHAR(80)     UNIQUE,
  image         VARCHAR(255)    DEFAULT NULL,
  images        JSON            DEFAULT NULL,
  featured      TINYINT(1)      NOT NULL DEFAULT 0,
  active        TINYINT(1)      NOT NULL DEFAULT 1,
  views         INT             DEFAULT 0,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_slug      (slug),
  INDEX idx_category  (category_id),
  INDEX idx_active    (active),
  FULLTEXT INDEX idx_search (name, description)
) ENGINE=InnoDB;

-- ── ORDERS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT            NOT NULL,
  status          ENUM('pending','paid','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  subtotal        DECIMAL(10,2)  NOT NULL,
  shipping_cost   DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  total           DECIMAL(10,2)  NOT NULL,
  payment_method  VARCHAR(60)    DEFAULT 'pix',
  address_json    JSON           NOT NULL,
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_user   (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- ── ORDER ITEMS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  order_id     INT           NOT NULL,
  product_id   INT           NOT NULL,
  quantity     INT           NOT NULL,
  unit_price   DECIMAL(10,2) NOT NULL,
  total        DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_order (order_id)
) ENGINE=InnoDB;

-- ── REVIEWS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id         INT        AUTO_INCREMENT PRIMARY KEY,
  product_id INT        NOT NULL,
  user_id    INT        NOT NULL,
  rating     TINYINT    NOT NULL,
  title      VARCHAR(150),
  comment    TEXT,
  approved   TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  UNIQUE KEY uq_review (product_id, user_id)
) ENGINE=InnoDB;

-- ============================================================
--  SEEDS (Initial Data)
-- ============================================================

-- Admin: admin@calipe.ao | password: Admin@2026
INSERT INTO users (name, email, password, role) VALUES
('Admin Calipe', 'admin@calipe.ao',
 '$2y$12$YQr5eN.T6s5BOQlT3dKYme.FwROdHe/2PxmKijbDHqwgWrN/ZoNGa', 'admin');

INSERT INTO categories (name, slug, description) VALUES
('Electrónica',    'electronica',  'Smartphones, tablets e gadgets'),
('Moda',           'moda',         'Roupas, calçados e acessórios'),
('Casa & Deco',    'casa-deco',    'Decoração, utensílios e móveis'),
('Beleza & Saúde', 'beleza-saude', 'Cosméticos e cuidados pessoais'),
('Desporto',       'desporto',     'Equipamento desportivo');

INSERT INTO products (category_id, name, slug, description, price, sale_price, stock, sku, active, featured) VALUES
(1, 'Smartphone X Pro 128GB',    'smartphone-x-pro',        'Ecran AMOLED 6.7", 108MP, 5000mAh',        85000.00, 79000.00, 15, 'EL-001', 1, 1),
(1, 'Auriculares Bluetooth Pro', 'auriculares-bt-pro',      'ANC, 30h autonomia, carga rápida',          12500.00, NULL,     40, 'EL-002', 1, 0),
(2, 'Camisa Linho Premium',      'camisa-linho-premium',    '100% linho natural, slim fit',               4500.00, 3800.00,  60, 'MD-001', 1, 1),
(3, 'Luminária Bamboo Natural',  'luminaria-bamboo',        'Design artesanal, LED 12W incluído',         8900.00, NULL,     25, 'CD-001', 1, 1),
(4, 'Kit Skincare Orgânico',     'kit-skincare-organico',   'Hidratante, sérum e tónico naturais',        6200.00, 5500.00,  35, 'BS-001', 1, 0),
(5, 'Kit Fitness Completo',      'kit-fitness-completo',    'Halteres 10kg + tapete + elásticos',         9800.00, NULL,     20, 'DS-001', 1, 0);
