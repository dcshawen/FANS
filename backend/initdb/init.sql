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
  `phone_number` VARCHAR(30),
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

-- Tag table (related to Organization)
CREATE TABLE IF NOT EXISTS `Tag` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `location_id` INT NOT NULL,
  `tag` VARCHAR(255) NOT NULL,
  FOREIGN KEY (`location_id`) REFERENCES `Organization`(`location_id`) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_contact_location ON `Contact`(`location_id`);
CREATE INDEX idx_schedule_location ON `Schedule`(`location_id`);
CREATE INDEX idx_foodoffered_location ON `FoodOffered`(`location_id`);
CREATE INDEX idx_tag_location ON `Tag`(`location_id`);


INSERT INTO `Organization`
  (`name`, `description`, `street_address`, `city`, `postal_code`, `latitude`, `longitude`)
VALUES
-- Hope Cottage
('Hope Cottage',
 'Hope’s Cottage is a long‑standing community soup kitchen in Halifax that helps address this need by providing free, nutritious meals in a safe and respectful environment.
 Providing Eat-in and Take-Away meals twice daily (lunch and supper) No cost, no referral required, and no judgment. Support for people experiencing homelessness or financial hardship.
 Food donations at the door from 10am to 6pm M–F.',
 '2435 Brunswick St', 'Halifax, NS', 'B3K 2Z4', NULL, NULL),

-- Brunswick Street Mission
('Brunswick Street Mission',
 'Brunswick Street Mission is a community support organization in Halifax’s North End that addresses food insecurity and poverty in a welcoming and dignified environment.
 Providing hot breakfasts, a food bank, and drop‑in supports. No cost, no referral required. Support for individuals experiencing homelessness or financial hardship. Additional services include laundry access, ID support, and outreach services.
 Meals typically include hot items (such as eggs, oatmeal, or casseroles) along with bread, fruit, and beverages. Designed to offer a nutritious start to the day.
',
 '2107 Brunswick St', 'Halifax, NS', 'B3K 2Y4', NULL, NULL),

-- Margaret’s House (F.O.O.D.)
('Margaret’s House (F.O.O.D.)',
 'Margaret’s House is a volunteer‑run meal program in Dartmouth providing nutritious food to adults in need across HRM.
 Providing free home‑cooked take‑away lunches Monday–Friday. No cost and no referral required. Focused on dignity, care, and community support.
 Meals are freshly prepared by volunteers and usually include a hot main dish, sides, and occasionally dessert.
',
 '43 Wentworth St', 'Dartmouth, NS', 'B2Y 2T1', NULL, NULL),

-- Parker Street Food Bank
('Parker Street Food Bank',
 'Parker Street Food Bank supports individuals and families in HRM who are struggling to meet basic needs.
 Providing food boxes, emergency assistance, and furniture support. Services are free and by appointment. Support for households facing financial hardship or crisis.
 Food boxes from Parker Street Food Bank contain a selection of essential grocery items designed to help individuals and families prepare meals at home. The exact contents vary based on household size, dietary needs, and available donations, but boxes usually include a balanced mix of staple foods.
 Typical food box items may include:
 Canned goods such as vegetables, beans, soups, and fruit.
 Dry pantry items like pasta, rice, cereal, flour, and oatmeal.
 Protein options such as canned tuna, peanut butter, beans, or lentils.
 Dairy or dairy alternatives when available (milk, powdered milk, or shelf‑stable options).
 Bread or bakery items.
 Fresh produce including fruits and vegetables when in stock.
 Basic household food staples like cooking oil or condiments (availability varies).
 Food boxes are tailored to the size of the household, meaning families, single adults, and seniors receive appropriate amounts.
',
 '2415 Maynard St', 'Halifax, NS', 'B3K 3V2', NULL, NULL),


-- Feeding Others of Dartmouth
('Feeding Others of Dartmouth',
 'Feeding Others of Dartmouth operates community meal services through Margaret’s House.
 Providing free hot and take‑away meals to adults experiencing food insecurity. No cost, no referral required. Supported by volunteers and community donations.',
 '43 Wentworth St', 'Dartmouth, NS', NULL, NULL, NULL),

-- Souls Harbour Rescue Mission
('Souls Harbour Rescue Mission',
 'Souls Harbour Rescue Mission supports people facing hunger, homelessness, and crisis in Halifax and across Nova Scotia.
 Providing free hot meals, drop‑in services, clothing, and shelter supports. No cost, no referral required. A safe and welcoming environment for immediate food support.
 Meals are substantial and may include meat or vegetarian options, sides, soup, and beverages. Designed to address immediate hunger in a safe, supportive environment.
',
 '5568 Cunard St', 'Halifax, NS', NULL, NULL, NULL),

-- St. George’s Anglican Church
('St. George’s Anglican Church',
 'St. George’s Anglican Church offers a regular community meal program in Halifax.
 Providing a free hot supper once a week. Meals are simple, warm, and nourishing, often including a main dish with sides. Open to anyone experiencing food insecurity. No cost and no referral required.',
 '2222 Brunswick St', 'Halifax, NS', NULL, NULL, NULL),

-- St. Matthew’s United Church
('St. Matthew’s United Church',
 'St. Matthew’s United Church provides a weekly free breakfast program, welcoming individuals experiencing food insecurity in downtown Halifax. Meals typically include hot breakfast items, bread, fruit, and hot beverages. Focused on nourishment and community connection.',
 '1479 Barrington St', 'Halifax, NS', NULL, NULL, NULL),

-- David’s Place Drop-In (The Presbyterian Church of Saint David)
('David’s Place Drop-In',
 'David’s Place Drop‑In provides a free hot takeaway lunch for people experiencing food insecurity in Halifax. Meals are prepared by volunteers and change weekly, but are always intended to be filling, nutritious, and comforting.
 Meal details:
 Hot, freshly prepared meals (menu varies each week)
 Typically includes a main dish (such as casseroles, soups, stews, pasta, or similar hearty meals)
 Often paired with bread and/or a simple side, depending on availability.
 Meals are served take‑away style for convenience.
',
 '1537 Brunswick St', 'Halifax, NS', NULL, NULL, NULL),

-- Happy at Home Halifax
('Happy at Home Halifax',
 'Happy at Home Halifax supports seniors (55+)who face barriers to food access and meal preparation.
 Providing free frozen meals delivered weekly to seniors’ homes. No cost. Designed to help seniors remain safe, nourished, and independent at home.
 Meals include a main dish, roll, and dessert, designed to be reheated easily.
',
 'Delivery (no fixed site)', 'Halifax, NS', NULL, NULL, NULL),


-- Sunday Supper - St. Andrew’s
('Sunday Supper - St. Andrew’s',
 'Sunday Supper is a longstanding community meal program in Halifax.
 Providing a free hot meal every Sunday evening, available for eat‑in or take‑away. No cost, no referral required. Focused on dignity, belonging, and community care.
 Meals are home‑style and generous, typically including a main course, sides, and dessert.',
 '6036 Coburg Rd', 'Halifax, NS', NULL, NULL, NULL),

-- St. Mary’s Basilica Drop-In (Daily Bread)
('St. Mary’s Basilica Drop-In (Daily Bread)',
 'St. Mary’s Basilica hosts a weekday drop‑in food program in central Halifax.
 Providing sandwiches, snacks, and hot or cold beverages during daytime hours. No cost, no referral required.',
 '5221 Spring Garden Rd', 'Halifax, NS', NULL, NULL, NULL),

-- Brunswick Street Mission Café
('Brunswick Street Mission Café',
 'The Brunswick Street Mission Café (Red Door Café) is a safe drop‑in space connected to food‑security services.
 Providing snacks, sandwiches, baked goods, and beverages, alongside a warm indoor space for rest and connection. No cost and open to those in need.',
 '2107 Brunswick St', 'Halifax, NS', NULL, NULL, NULL),


-- Dartmouth North Christian Food Bank
('Dartmouth North Christian Food Bank',
 'Dartmouth North Christian Food Bank serves residents of Dartmouth North experiencing food insecurity.
 Providing emergency food assistance for individuals and families. No cost. Community‑based support.
 Note: Does not provide prepared meals.
 Offers food hampers with groceries for home cooking, including canned and dry goods and fresh items when available.',
 '27 Farrell St', 'Dartmouth, NS', NULL, NULL, NULL),


-- Family SOS Community Market
('Family SOS Community Market',
 'Family SOS Community Market helps families manage rising food costs while maintaining dignity and choice.
 Providing affordable groceries through a community market model. Designed to support families experiencing financial pressure.
',
 '4 Cranberry Court', 'Halifax, NS', NULL, NULL, NULL),

-- The Loaded Ladle
('The Loaded Ladle',
 'The Loaded Ladle is a student‑run, nonprofit food program in Halifax.
 Providing free, nutritious vegetarian meals, primarily for students but open to the broader community. No cost and no referral required.
 Meals are nutritious and often include a hot entrée, vegetables, and grains.',
 '6136 University Ave', 'Halifax, NS', NULL, NULL, NULL),

-- The North Grove
('The North Grove',
 'The North Grove is a family resource and community hub focused on long‑term food security.
 Providing community food programs, markets, and family supports to improve access to healthy food.
',
 '6 Primrose St', 'Dartmouth, NS', NULL, NULL, NULL),

-- Salvation Army (Gottingen St)
('Salvation Army',
 'Food bank; The Salvation Army supports individuals and families facing food insecurity across HRM.
 Providing food banks, hot meals, and emergency food assistance. No cost, no referral required.
 Meals are typically simple, nutritious, and free, and food banks provide groceries for home preparation.
 Note: appointment usually required.
',
 '2038 Gottingen St', 'Halifax, NS', NULL, NULL, NULL),


-- Community Fridges (multiple sites)
('Community Fridges',
 'Community Fridges are public, shared food‑access points located throughout HRM.
 Providing free, 24/7 access to food. Anyone may take food when needed or donate food for others.
 May include prepared meals, snacks, fresh produce, and packaged foods..',
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


-- =========================
-- TAG SEED DATA
-- =========================

-- Hope Cottage
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Hot Meals' FROM `Organization` WHERE `name`='Hope Cottage';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Takeout' FROM `Organization` WHERE `name`='Hope Cottage';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Daily Meals' FROM `Organization` WHERE `name`='Hope Cottage';

-- Brunswick Street Mission
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Breakfast' FROM `Organization` WHERE `name`='Brunswick Street Mission';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Food Support' FROM `Organization` WHERE `name`='Brunswick Street Mission';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Weekday Service' FROM `Organization` WHERE `name`='Brunswick Street Mission';

-- Margaret's House (F.O.O.D.)
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Home-Cooked Meals' FROM `Organization` WHERE `name`='Margaret’s House (F.O.O.D.)';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Lunch Service' FROM `Organization` WHERE `name`='Margaret’s House (F.O.O.D.)';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Donations Accepted' FROM `Organization` WHERE `name`='Margaret’s House (F.O.O.D.)';

-- Parker Street Food Bank
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Food Bank' FROM `Organization` WHERE `name`='Parker Street Food Bank';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Take-Home Boxes' FROM `Organization` WHERE `name`='Parker Street Food Bank';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Grocery Support' FROM `Organization` WHERE `name`='Parker Street Food Bank';

-- Feeding Others of Dartmouth
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Daily Meals' FROM `Organization` WHERE `name`='Feeding Others of Dartmouth';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Lunch' FROM `Organization` WHERE `name`='Feeding Others of Dartmouth';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Supper' FROM `Organization` WHERE `name`='Feeding Others of Dartmouth';

-- Souls Harbour Rescue Mission
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Hot Lunch' FROM `Organization` WHERE `name`='Souls Harbour Rescue Mission';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Weekday Service' FROM `Organization` WHERE `name`='Souls Harbour Rescue Mission';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Drop-In' FROM `Organization` WHERE `name`='Souls Harbour Rescue Mission';

-- St. George's Anglican Church
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Community Supper' FROM `Organization` WHERE `name`='St. George’s Anglican Church';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Weekend Service' FROM `Organization` WHERE `name`='St. George’s Anglican Church';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Faith-Based' FROM `Organization` WHERE `name`='St. George’s Anglican Church';

-- St. Matthew's United Church
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Breakfast' FROM `Organization` WHERE `name`='St. Matthew’s United Church';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Sunday Service' FROM `Organization` WHERE `name`='St. Matthew’s United Church';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Faith-Based' FROM `Organization` WHERE `name`='St. Matthew’s United Church';

-- David's Place Drop-In
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Snacks' FROM `Organization` WHERE `name`='David’s Place Drop-In';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Light Meals' FROM `Organization` WHERE `name`='David’s Place Drop-In';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Drop-In' FROM `Organization` WHERE `name`='David’s Place Drop-In';

-- Happy at Home Halifax
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Seniors 55+' FROM `Organization` WHERE `name`='Happy at Home Halifax';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Meal Delivery' FROM `Organization` WHERE `name`='Happy at Home Halifax';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Waitlist' FROM `Organization` WHERE `name`='Happy at Home Halifax';

-- Sunday Supper - St. Andrew's
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Community Supper' FROM `Organization` WHERE `name`='Sunday Supper - St. Andrew’s';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Sunday Service' FROM `Organization` WHERE `name`='Sunday Supper - St. Andrew’s';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Faith-Based' FROM `Organization` WHERE `name`='Sunday Supper - St. Andrew’s';

-- St. Mary's Basilica Drop-In (Daily Bread)
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Snacks' FROM `Organization` WHERE `name`='St. Mary’s Basilica Drop-In (Daily Bread)';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Hot Beverages' FROM `Organization` WHERE `name`='St. Mary’s Basilica Drop-In (Daily Bread)';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Weekday Service' FROM `Organization` WHERE `name`='St. Mary’s Basilica Drop-In (Daily Bread)';

-- Brunswick Street Mission Café
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Snacks' FROM `Organization` WHERE `name`='Brunswick Street Mission Café';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Beverages' FROM `Organization` WHERE `name`='Brunswick Street Mission Café';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Drop-In' FROM `Organization` WHERE `name`='Brunswick Street Mission Café';

-- Dartmouth North Christian Food Bank
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Food Bank' FROM `Organization` WHERE `name`='Dartmouth North Christian Food Bank';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Weekly Access' FROM `Organization` WHERE `name`='Dartmouth North Christian Food Bank';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Faith-Based' FROM `Organization` WHERE `name`='Dartmouth North Christian Food Bank';

-- Family SOS Community Market
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Community Market' FROM `Organization` WHERE `name`='Family SOS Community Market';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Registration Required' FROM `Organization` WHERE `name`='Family SOS Community Market';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Family Support' FROM `Organization` WHERE `name`='Family SOS Community Market';

-- The Loaded Ladle
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Plant-Based' FROM `Organization` WHERE `name`='The Loaded Ladle';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Vegan' FROM `Organization` WHERE `name`='The Loaded Ladle';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Gluten-Friendly' FROM `Organization` WHERE `name`='The Loaded Ladle';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Bring Your Own Container' FROM `Organization` WHERE `name`='The Loaded Ladle';

-- The North Grove
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Community Hub' FROM `Organization` WHERE `name`='The North Grove';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Meal Support' FROM `Organization` WHERE `name`='The North Grove';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Family Support' FROM `Organization` WHERE `name`='The North Grove';

-- Salvation Army
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Food Bank' FROM `Organization` WHERE `name`='Salvation Army';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Appointment Required' FROM `Organization` WHERE `name`='Salvation Army';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Emergency Support' FROM `Organization` WHERE `name`='Salvation Army';

-- Community Fridges
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, '24/7 Access' FROM `Organization` WHERE `name`='Community Fridges';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Mutual Aid' FROM `Organization` WHERE `name`='Community Fridges';
INSERT INTO `Tag` (`location_id`, `tag`) SELECT `location_id`, 'Multiple Locations' FROM `Organization` WHERE `name`='Community Fridges';
