-- ============================================================
-- IBTU E-Commerce Database Schema
-- Database: ibutu_ecommerce
-- Engine: InnoDB | Charset: utf8mb4 (supports Amharic / Ethiopic)
-- ============================================================
-- Run this file inside XAMPP phpMyAdmin or via MySQL CLI:
--   mysql -u root -p ibutu_ecommerce < schema.sql
-- ============================================================

USE `ibutu_ecommerce`;

-- ─── 1. Users ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id`                   INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `first_name`           VARCHAR(50)       NOT NULL,
  `last_name`            VARCHAR(50)       NOT NULL,
  `email`                VARCHAR(100)      NOT NULL,
  `password_hash`        VARCHAR(255)      NOT NULL,
  `phone`                VARCHAR(20)       DEFAULT NULL,
  `role`                 ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  `reset_token`          VARCHAR(255)      DEFAULT NULL,
  `reset_token_expires`  DATETIME          DEFAULT NULL,
  `created_at`           DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 2. Categories ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `categories` (
  `id`           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `name`         VARCHAR(100)  NOT NULL,
  `amharic_name` VARCHAR(100)  DEFAULT NULL,
  `slug`         VARCHAR(100)  NOT NULL,
  `description`  TEXT          DEFAULT NULL,
  `image`        VARCHAR(500)  DEFAULT NULL,
  `display_order` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `is_active`    TINYINT(1)    NOT NULL DEFAULT 1,
  `created_at`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 3. Products ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `products` (
  `id`              INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `name`            VARCHAR(200)   NOT NULL,
  `amharic_name`    VARCHAR(200)   DEFAULT NULL,
  `slug`            VARCHAR(200)   NOT NULL,
  `category_id`     INT UNSIGNED   DEFAULT NULL,
  `description`     TEXT           DEFAULT NULL,
  `price`           DECIMAL(10,2)  NOT NULL,
  `original_price`  DECIMAL(10,2)  DEFAULT NULL,
  `stock_count`     INT UNSIGNED   NOT NULL DEFAULT 0,
  `fabric`          VARCHAR(200)   DEFAULT NULL,
  `sizes`           JSON           DEFAULT NULL,  -- e.g. ["XS","S","M","L","XL"]
  `colors`          JSON           DEFAULT NULL,  -- e.g. ["#103321","#ffffff"]
  `images`          JSON           DEFAULT NULL,  -- array of image URLs / filenames
  `rating`          DECIMAL(3,2)   NOT NULL DEFAULT 0.00,
  `reviews_count`   INT UNSIGNED   NOT NULL DEFAULT 0,
  `badge`           VARCHAR(50)    DEFAULT NULL,  -- e.g. "New", "Sale", "Best Seller"
  `is_featured`     TINYINT(1)     NOT NULL DEFAULT 0,
  `is_best_seller`  TINYINT(1)     NOT NULL DEFAULT 0,
  `is_new_arrival`  TINYINT(1)     NOT NULL DEFAULT 0,
  `is_traditional`  TINYINT(1)     NOT NULL DEFAULT 0,
  `is_active`       TINYINT(1)     NOT NULL DEFAULT 1,
  `created_at`      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_products_slug` (`slug`),
  INDEX `idx_products_category` (`category_id`),
  INDEX `idx_products_featured` (`is_featured`),
  INDEX `idx_products_best_seller` (`is_best_seller`),
  INDEX `idx_products_new_arrival` (`is_new_arrival`),
  INDEX `idx_products_active` (`is_active`),
  CONSTRAINT `fk_products_category`
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 4. Cart Items ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `cart_items` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `user_id`     INT UNSIGNED  NOT NULL,
  `product_id`  INT UNSIGNED  NOT NULL,
  `quantity`    SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `size`        VARCHAR(10)   DEFAULT NULL,
  `color`       VARCHAR(50)   DEFAULT NULL,
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_cart_user` (`user_id`),
  CONSTRAINT `fk_cart_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cart_product`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 5. Orders ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `orders` (
  `id`               INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `user_id`          INT UNSIGNED   NOT NULL,
  `status`           ENUM('pending','processing','shipped','delivered','cancelled')
                                    NOT NULL DEFAULT 'pending',
  `shipping_address` JSON           NOT NULL,
  `total_amount`     DECIMAL(10,2)  NOT NULL,
  `shipping_fee`     DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  `payment_method`   VARCHAR(50)    NOT NULL DEFAULT 'cod',
  `payment_status`   ENUM('pending','paid','failed','refunded')
                                    NOT NULL DEFAULT 'pending',
  `notes`            TEXT           DEFAULT NULL,
  `created_at`       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_orders_user` (`user_id`),
  INDEX `idx_orders_status` (`status`),
  CONSTRAINT `fk_orders_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 6. Order Items ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `order_items` (
  `id`           INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `order_id`     INT UNSIGNED   NOT NULL,
  `product_id`   INT UNSIGNED   DEFAULT NULL,
  `product_name` VARCHAR(200)   NOT NULL,  -- snapshot at time of order
  `quantity`     SMALLINT UNSIGNED NOT NULL,
  `unit_price`   DECIMAL(10,2)  NOT NULL,
  `size`         VARCHAR(10)    DEFAULT NULL,
  `color`        VARCHAR(50)    DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_order_items_order` (`order_id`),
  CONSTRAINT `fk_order_items_order`
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_order_items_product`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 7. Seed Data ───────────────────────────────────────────────────────────
-- Default admin user (password: Admin@1234 — CHANGE IN PRODUCTION)
-- bcrypt hash for 'Admin@1234' with 12 rounds:
-- $2a$12$y6xKGFO8C.0FhO8.X.4TnuF/f/1NMqv4XnqiRPIMI8O4s1YRvHEDi
INSERT IGNORE INTO `users` (first_name, last_name, email, password_hash, role)
VALUES ('Ibtu', 'Admin', 'admin@ibtu.com',
        '$2a$12$y6xKGFO8C.0FhO8.X.4TnuF/f/1NMqv4XnqiRPIMI8O4s1YRvHEDi', 'admin');

-- Default categories
INSERT IGNORE INTO `categories` (name, amharic_name, slug, display_order) VALUES
  ('Men',        'ወንዶች',   'men',       1),
  ('Women',      'ሴቶች',    'women',     2),
  ('Kids',       'ልጆች',    'kids',      3),
  ('Traditional','ባህላዊ',   'traditional', 4),
  ('Outerwear',  'ኮት',     'outerwear', 5);
