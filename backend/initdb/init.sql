-- Initialization SQL for MariaDB (runs only on first container start)
CREATE DATABASE IF NOT EXISTS `fansdb`;
USE `fansdb`;

CREATE TABLE IF NOT EXISTS `fans_table` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
