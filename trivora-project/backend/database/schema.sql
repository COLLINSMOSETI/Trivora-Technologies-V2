CREATE DATABASE IF NOT EXISTS trivora_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE trivora_db;

CREATE TABLE IF NOT EXISTS admins (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS inquiries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(40) NULL,
  service VARCHAR(100) NOT NULL,
  budget VARCHAR(80) NULL,
  message TEXT NOT NULL,
  status ENUM('new','in_progress','contacted','completed','archived') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_inquiries_created_at (created_at),
  INDEX idx_inquiries_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS services (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  slug VARCHAR(140) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  starting_price_ksh INT UNSIGNED NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT IGNORE INTO services (name, slug, description, starting_price_ksh) VALUES
('Website Development','website-development','Responsive business, corporate, e-commerce and portfolio websites.',30000),
('System Integration','system-integration','Connect business tools, platforms, APIs and workflows.',NULL),
('Web & Mobile Apps','web-mobile-apps','Purpose-built web applications, mobile app projects and dashboards.',NULL),
('Maintenance & Support','maintenance-support','Updates, troubleshooting, performance improvements and ongoing care.',NULL);
