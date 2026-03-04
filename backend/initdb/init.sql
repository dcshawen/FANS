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


INSERT INTO `Organization`
  (`name`, `description`, `street_address`, `city`, `postal_code`, `latitude`, `longitude`)
VALUES
-- Hope Cottage
('Hope Cottage',
 'Eat-in and takeaway meals twice daily; menu varies.',
 '2435 Brunswick St', 'Halifax, NS', 'B3K 2Z4', NULL, NULL),

-- Brunswick Street Mission
('Brunswick Street Mission',
 'Free breakfast and food support.',
 '2107 Brunswick St', 'Halifax, NS', 'B3K 2Y4', NULL, NULL),

-- Margaret’s House (F.O.O.D.)
('Margaret’s House (F.O.O.D.)',
 'Free home-cooked meals; donations accepted at listed hours.',
 '43 Wentworth St', 'Dartmouth, NS', 'B2Y 2T1', NULL, NULL),

-- Parker Street Food Bank
('Parker Street Food Bank',
 'Free food boxes; not cooked meals.',
 '2415 Maynard St', 'Halifax, NS', 'B3K 3V2', NULL, NULL),


-- Feeding Others of Dartmouth
('Feeding Others of Dartmouth',
 'Daily free meals.',
 '43 Wentworth St', 'Dartmouth, NS', NULL, NULL, NULL),

-- Souls Harbour Rescue Mission
('Souls Harbour Rescue Mission',
 'Free hot lunch.',
 '5568 Cunard St', 'Halifax, NS', NULL, NULL, NULL),

-- St. George’s Anglican Church
('St. George’s Anglican Church',
 'Free community supper.',
 '2222 Brunswick St', 'Halifax, NS', NULL, NULL, NULL),

-- St. Matthew’s United Church
('St. Matthew’s United Church',
 'Free breakfast.',
 '1479 Barrington St', 'Halifax, NS', NULL, NULL, NULL),

-- David’s Place Drop-In (The Presbyterian Church of Saint David)
('David’s Place Drop-In',
 'Free snacks/light food.',
 '1537 Brunswick St', 'Halifax, NS', NULL, NULL, NULL),

-- Happy at Home Halifax
('Happy at Home Halifax',
 'Free frozen meal delivery for seniors (55+); waitlist applies.',
 'Delivery (no fixed site)', 'Halifax, NS', NULL, NULL, NULL),


-- Sunday Supper - St. Andrew’s
('Sunday Supper - St. Andrew’s',
 'Free weekly supper.',
 '6036 Coburg Rd', 'Halifax, NS', NULL, NULL, NULL),

-- St. Mary’s Basilica Drop-In (Daily Bread)
('St. Mary’s Basilica Drop-In (Daily Bread)',
 'Free light food/snacks/hot beverages.',
 '5221 Spring Garden Rd', 'Halifax, NS', NULL, NULL, NULL),

-- Brunswick Street Mission Café
('Brunswick Street Mission Café',
 'Free beverages/snacks.',
 '2107 Brunswick St', 'Halifax, NS', NULL, NULL, NULL),


-- Dartmouth North Christian Food Bank
('Dartmouth North Christian Food Bank',
 'Food bank access once a week.',
 '27 Farrell St', 'Dartmouth, NS', NULL, NULL, NULL),


-- Family SOS Community Market
('Family SOS Community Market',
 'Free community market; pre‑registration required.',
 '4 Cranberry Court', 'Halifax, NS', NULL, NULL, NULL),

-- The Loaded Ladle
('The Loaded Ladle',
 'Free fresh plant-based meals (vegan/gluten-friendly); bring your own container.',
 '6136 University Ave', 'Halifax, NS', NULL, NULL, NULL),

-- The North Grove
('The North Grove',
 'Community hub with meals and food support (see weekly calendar).',
 '6 Primrose St', 'Dartmouth, NS', NULL, NULL, NULL),

-- Salvation Army (Gottingen St)
('Salvation Army',
 'Food bank; appointment usually required.',
 '2038 Gottingen St', 'Halifax, NS', NULL, NULL, NULL),


-- Community Fridges (multiple sites)
('Community Fridges',
 'Free food access pantry — take what you need, leave what you can.',
 'Multiple locations', 'Halifax/Dartmouth, NS', NULL, NULL, NULL);


-- =========================
-- CONTACT SEED DATA
-- =========================

-- Hope Cottage
INSERT INTO `Contact` (`location_id`, `phone_number`, `websit_url`)
SELECT location_id, '902-429-7968', 'https://www.hopecottage.ca/' FROM `Organization` WHERE `name`='Hope Cottage';


-- Brunswick Street Mission
INSERT INTO `Contact` (`location_id`, `phone_number`, `websit_url`)
SELECT location_id, '902-423-4605', 'https://www.brunswickstreetmission.org/' FROM `Organization` WHERE `name`='Brunswick Street Mission';


-- Margaret’s House (F.O.O.D.)
INSERT INTO `Contact` (`location_id`, `phone_number`, `websit_url`)
SELECT location_id, '902-464-2919', 'https://margarets-house.ca/' FROM `Organization` WHERE `name`='Margaret’s House (F.O.O.D.)';


-- Parker Street Food Bank
INSERT INTO `Contact` (`location_id`, `phone_number`, `websit_url`)
SELECT location_id, '902-425-2125', 'https://parkerstreet.org' FROM `Organization` WHERE `name`='Parker Street Food Bank';

-- Feeding Others of Dartmouth
INSERT INTO `Contact` (`location_id`, `phone_number`, `websit_url`)
SELECT location_id, '902-464-2919', 'https://margarets-house.ca/' FROM `Organization` WHERE `name`='Feeding Others of Dartmouth';

-- Souls Harbour Rescue Mission
INSERT INTO `Contact` (`location_id`, `phone_number`, `websit_url`)
SELECT location_id, '902-405-4663', 'https://soulsharbour.ca/' FROM `Organization` WHERE `name`='Souls Harbour Rescue Mission';

-- St. George’s Anglican Church
INSERT INTO `Contact` (`location_id`, `phone_number`, `websit_url`)
SELECT location_id, '902-423-1059', 'https://www.roundchurch.ca/' FROM `Organization` WHERE `name`='St. George’s Anglican Church';


-- St. Matthew’s United Church
INSERT INTO `Contact` (`location_id`, `phone_number`, `websit_url`)
SELECT location_id, '902-423-9209', 'https://www.stmatts.ns.ca/breakfast-program' FROM `Organization` WHERE `name`='St. Matthew’s United Church';

-- David’s Place Drop-In
INSERT INTO `Contact` (`location_id`, `phone_number`, `websit_url`)
SELECT location_id, NULL, 'https://saintdavids.ca/davids-place/' FROM `Organization` WHERE `name`='David’s Place Drop-In';


-- Happy at Home Halifax
INSERT INTO `Contact` (`location_id`, `phone_number`, `websit_url`)
SELECT location_id, '902-414-7032', 'https://www.happyathomehalifax.com/' FROM `Organization` WHERE `name`='Happy at Home Halifax';


-- Sunday Supper - St. Andrew’s
INSERT INTO `Contact` (`location_id`, `phone_number`, `websit_url`)
SELECT location_id, '902-492-1454', 'https://saintandrewshfx.ca/sunday-suppers' FROM `Organization` WHERE `name`='Sunday Supper - St. Andrew’s';


-- St. Mary’s Basilica Drop-In (Daily Bread)
INSERT INTO `Contact` (`location_id`, `phone_number`, `websit_url`)
SELECT location_id, '902-429-9800', 'https://stmcathedral.com/ministries/daily-bread' FROM `Organization` WHERE `name`='St. Mary’s Basilica Drop-In (Daily Bread)';


-- Brunswick Street Mission Café
INSERT INTO `Contact` (`location_id`, `phone_number`, `websit_url`)
SELECT location_id, '902-422-5028', 'https://www.brunswickstreetmission.org/our-services/cafe' FROM `Organization` WHERE `name`='Brunswick Street Mission Café';


-- Dartmouth North Christian Food Bank
INSERT INTO `Contact` (`location_id`, `phone_number`, `websit_url`)
SELECT location_id, '902-466-2475', 'https://lifebranch.ca/food-bank' FROM `Organization` WHERE `name`='Dartmouth North Christian Food Bank';

-- Family SOS Community Market
INSERT INTO `Contact` (`location_id`, `phone_number`, `websit_url`)
SELECT location_id, '902-455-5515 ext. 325', 'https://familysos.ca/food-and-essentials-support' FROM `Organization` WHERE `name`='Family SOS Community Market';

-- The Loaded Ladle
INSERT INTO `Contact` (`location_id`, `phone_number`, `websit_url`)
SELECT location_id, '902-709-3022', 'https://www.loadedladle.com/' FROM `Organization` WHERE `name`='The Loaded Ladle';


-- The North Grove
INSERT INTO `Contact` (`location_id`, `phone_number`, `websit_url`)
SELECT location_id, '902-464-8234', 'https://www.thenorthgrove.ca/' FROM `Organization` WHERE `name`='The North Grove';


-- Salvation Army
INSERT INTO `Contact` (`location_id`, `phone_number`, `websit_url`)
SELECT location_id, '902-422-1598', 'https://salvationarmy.ca/you-can-bring-hope/feeding-people-in-need/' FROM `Organization` WHERE `name`='Salvation Army';


-- Community Fridges
INSERT INTO `Contact` (`location_id`, `phone_number`, `websit_url`)
SELECT location_id, NULL, 'https://www.communityfridgehfx.com/' FROM `Organization` WHERE `name`='Community Fridges';



-- =========================
-- SCHEDULE SEED DATA
-- =========================

-- Hope Cottage (Mon–Fri: Lunch 11:00–12:00, Supper 17:00–18:00)
-- Days: Monday–Friday
SET @org := (SELECT location_id FROM `Organization` WHERE `name`='Hope Cottage');
INSERT INTO `Schedule` (`location_id`, `day_of_week`, `open_time`, `close_time`)
VALUES 
(@org,'Monday','11:00','12:00'),(@org,'Monday','17:00','18:00'),
(@org,'Tuesday','11:00','12:00'),(@org,'Tuesday','17:00','18:00'),
(@org,'Wednesday','11:00','12:00'),(@org,'Wednesday','17:00','18:00'),
(@org,'Thursday','11:00','12:00'),(@org,'Thursday','17:00','18:00'),
(@org,'Friday','11:00','12:00'),(@org,'Friday','17:00','18:00');


-- Brunswick Street Mission (Breakfast Mon–Fri 07:15–08:30)
SET @org := (SELECT location_id FROM `Organization` WHERE `name`='Brunswick Street Mission');
INSERT INTO `Schedule` (`location_id`, `day_of_week`, `open_time`, `close_time`)
VALUES
(@org,'Monday','07:15','08:30'),
(@org,'Tuesday','07:15','08:30'),
(@org,'Wednesday','07:15','08:30'),
(@org,'Thursday','07:15','08:30'),
(@org,'Friday','07:15','08:30');


-- Margaret’s House (Mon–Fri 11:30–12:30)
SET @org := (SELECT location_id FROM `Organization` WHERE `name`='Margaret’s House (F.O.O.D.)');
INSERT INTO `Schedule` (`location_id`, `day_of_week`, `open_time`, `close_time`)
VALUES
(@org,'Monday','11:30','12:30'),
(@org,'Tuesday','11:30','12:30'),
(@org,'Wednesday','11:30','12:30'),
(@org,'Thursday','11:30','12:30'),
(@org,'Friday','11:30','12:30');

-- Parker Street Food Bank (Mon–Fri 08:00–16:00)
SET @org := (SELECT location_id FROM `Organization` WHERE `name`='Parker Street Food Bank');
INSERT INTO `Schedule` (`location_id`, `day_of_week`, `open_time`, `close_time`)
VALUES
(@org,'Monday','08:00','16:00'),
(@org,'Tuesday','08:00','16:00'),
(@org,'Wednesday','08:00','16:00'),
(@org,'Thursday','08:00','16:00'),
(@org,'Friday','08:00','16:00');


-- Feeding Others of Dartmouth (Lunch daily 12:00–12:30; Supper Mon–Wed 16:30–17:00)
SET @org := (SELECT location_id FROM `Organization` WHERE `name`='Feeding Others of Dartmouth');
-- Lunch 7 days
INSERT INTO `Schedule` (`location_id`, `day_of_week`, `open_time`, `close_time`)
VALUES
(@org,'Monday','12:00','12:30'),
(@org,'Tuesday','12:00','12:30'),
(@org,'Wednesday','12:00','12:30'),
(@org,'Thursday','12:00','12:30'),
(@org,'Friday','12:00','12:30'),
(@org,'Saturday','12:00','12:30'),
(@org,'Sunday','12:00','12:30');
-- Supper Mon–Wed
INSERT INTO `Schedule` (`location_id`, `day_of_week`, `open_time`, `close_time`)
VALUES
(@org,'Monday','16:30','17:00'),
(@org,'Tuesday','16:30','17:00'),
(@org,'Wednesday','16:30','17:00');


-- Souls Harbour Rescue Mission (Mon–Fri 13:00–15:00)
SET @org := (SELECT location_id FROM `Organization` WHERE `name`='Souls Harbour Rescue Mission');
INSERT INTO `Schedule` (`location_id`, `day_of_week`, `open_time`, `close_time`)
VALUES
(@org,'Monday','13:00','15:00'),
(@org,'Tuesday','13:00','15:00'),
(@org,'Wednesday','13:00','15:00'),
(@org,'Thursday','13:00','15:00'),
(@org,'Friday','13:00','15:00');


-- St. George’s Anglican Church (Sat 16:00–18:00)
SET @org := (SELECT location_id FROM `Organization` WHERE `name`='St. George’s Anglican Church');
INSERT INTO `Schedule` (`location_id`, `day_of_week`, `open_time`, `close_time`)
VALUES (@org,'Saturday','16:00','18:00');

-- St. Matthew’s United Church (Sun 09:00–10:00)
SET @org := (SELECT location_id FROM `Organization` WHERE `name`='St. Matthew’s United Church');
INSERT INTO `Schedule` (`location_id`, `day_of_week`, `open_time`, `close_time`)
VALUES (@org,'Sunday','09:00','10:00');

-- David’s Place Drop-In (Mon–Fri 10:00–13:00)
SET @org := (SELECT location_id FROM `Organization` WHERE `name`='David’s Place Drop-In');
INSERT INTO `Schedule` (`location_id`, `day_of_week`, `open_time`, `close_time`)
VALUES
(@org,'Monday','10:00','13:00'),
(@org,'Tuesday','10:00','13:00'),
(@org,'Wednesday','10:00','13:00'),
(@org,'Thursday','10:00','13:00'),
(@org,'Friday','10:00','13:00');

-- Sunday Supper - St. Andrew’s (Sun 16:00–17:30)
SET @org := (SELECT location_id FROM `Organization` WHERE `name`='Sunday Supper - St. Andrew’s');
INSERT INTO `Schedule` (`location_id`, `day_of_week`, `open_time`, `close_time`)
VALUES (@org,'Sunday','16:00','17:30');

-- St. Mary’s Basilica Drop-In (Mon–Fri 13:30–15:30)
SET @org := (SELECT location_id FROM `Organization` WHERE `name`='St. Mary’s Basilica Drop-In (Daily Bread)');
INSERT INTO `Schedule` (`location_id`, `day_of_week`, `open_time`, `close_time`)
VALUES
(@org,'Monday','13:30','15:30'),
(@org,'Tuesday','13:30','15:30'),
(@org,'Wednesday','13:30','15:30'),
(@org,'Thursday','13:30','15:30'),
(@org,'Friday','13:30','15:30');

-- Brunswick Street Mission Café (Tue–Thu 09:30–14:30)
SET @org := (SELECT location_id FROM `Organization` WHERE `name`='Brunswick Street Mission Café');
INSERT INTO `Schedule` (`location_id`, `day_of_week`, `open_time`, `close_time`)
VALUES
(@org,'Tuesday','09:30','14:30'),
(@org,'Wednesday','09:30','14:30'),
(@org,'Thursday','09:30','14:30');


-- Dartmouth North Christian Food Bank (Thu 09:30–12:00)
SET @org := (SELECT location_id FROM `Organization` WHERE `name`='Dartmouth North Christian Food Bank');
INSERT INTO `Schedule` (`location_id`, `day_of_week`, `open_time`, `close_time`)
VALUES (@org,'Thursday','09:30','12:00');


-- Family SOS Community Market (Fri 12:00–14:00)
SET @org := (SELECT location_id FROM `Organization` WHERE `name`='Family SOS Community Market');
INSERT INTO `Schedule` (`location_id`, `day_of_week`, `open_time`, `close_time`)
VALUES (@org,'Friday','12:00','14:00');


-- The Loaded Ladle (Tue–Thu 12:30–14:00)
SET @org := (SELECT location_id FROM `Organization` WHERE `name`='The Loaded Ladle');
INSERT INTO `Schedule` (`location_id`, `day_of_week`, `open_time`, `close_time`)
VALUES
(@org,'Tuesday','12:30','14:00'),
(@org,'Wednesday','12:30','14:00'),
(@org,'Thursday','12:30','14:00');

-- Salvation Army (Tue–Fri 09:00–15:00)
SET @org := (SELECT location_id FROM `Organization` WHERE `name`='Salvation Army');
INSERT INTO `Schedule` (`location_id`, `day_of_week`, `open_time`, `close_time`)
VALUES
(@org,'Tuesday','09:00','15:00'),
(@org,'Wednesday','09:00','15:00'),
(@org,'Thursday','09:00','15:00'),
(@org,'Friday','09:00','15:00');

-- Community Fridges (24/7 -> 00:00–23:59 all seven days)
SET @org := (SELECT location_id FROM `Organization` WHERE `name`='Community Fridges');
INSERT INTO `Schedule` (`location_id`, `day_of_week`, `open_time`, `close_time`)
VALUES
(@org,'Monday','00:00','23:59'),
(@org,'Tuesday','00:00','23:59'),
(@org,'Wednesday','00:00','23:59'),
(@org,'Thursday','00:00','23:59'),
(@org,'Friday','00:00','23:59'),
(@org,'Saturday','00:00','23:59'),
(@org,'Sunday','00:00','23:59');
food_insert_SQL.txt
food_insert_SQL.txt (16 KB)
16 KB
