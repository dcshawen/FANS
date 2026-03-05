-- Initialization SQL for MariaDB (runs only on first container start)
CREATE DATABASE IF NOT EXISTS `fansdb`;
USE `fansdb`;

-- Organization table (main entity)
CREATE TABLE IF NOT EXISTS `Organization` (
  `location_id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `street_address` VARCHAR(255),
  `city` VARCHAR(100),
  `postal_code` VARCHAR(20),
  `latitude` DECIMAL(10, 8),
  `longitude` DECIMAL(11, 8),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO `Organization`
  (`name`, `description`, `street_address`, `city`, `postal_code`, `latitude`, `longitude`)
VALUES
-- Hope Cottage
('Hope Cottage',
 'Eat-in and takeaway meals twice daily; menu varies.',
 '2435 Brunswick St', 'Halifax, NS', 'B3K 2Z4', NULL, NULL);


-- Contact table (related to Organization)
CREATE TABLE IF NOT EXISTS `Contact` (
  `contact_id` INT PRIMARY KEY AUTO_INCREMENT,
  `location_id` INT NOT NULL,
  `phone_number` VARCHAR(20),
  `websit_url` VARCHAR(500),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`location_id`) REFERENCES `Organization`(`location_id`) ON DELETE CASCADE
);

-- Schedule table (related to Organization)
CREATE TABLE IF NOT EXISTS `Schedule` (
  `hours_id` INT PRIMARY KEY AUTO_INCREMENT,
  `location_id` INT NOT NULL,
  `day_of_week` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  `open_time` TIME NOT NULL,
  `close_time` TIME NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`location_id`) REFERENCES `Organization`(`location_id`) ON DELETE CASCADE
);

-- FoodOffered table (related to Organization)
CREATE TABLE IF NOT EXISTS `FoodOffered` (
  `offering_id` INT PRIMARY KEY AUTO_INCREMENT,
  `location_id` INT NOT NULL,
  `offering_description` TEXT,
  `days_available` VARCHAR(255),
  `time_available` VARCHAR(255),
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`location_id`) REFERENCES `Organization`(`location_id`) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_contact_location ON `Contact`(`location_id`);
CREATE INDEX idx_schedule_location ON `Schedule`(`location_id`);
CREATE INDEX idx_foodoffered_location ON `FoodOffered`(`location_id`);
