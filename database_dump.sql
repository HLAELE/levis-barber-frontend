-- =====================================================
-- LEVIS BARBER - Financial Information System
-- Database Dump - May 26, 2026
-- =====================================================

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `role` enum('OWNER','EMPLOYEE','CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
  `is_approved` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample users
INSERT INTO `users` (`full_name`, `username`, `password`, `role`, `is_approved`, `created_at`) VALUES
('Levis Barber Owner', 'owner', 'owner123', 'OWNER', 1, NOW()),
('John Barber Employee', 'john', 'john123', 'EMPLOYEE', 1, NOW()),
('Sarah Barber Employee', 'sarah', 'sarah123', 'EMPLOYEE', 1, NOW()),
('Mike Customer', 'mike', 'mike123', 'CUSTOMER', 1, NOW()),
('David Customer', 'david', 'david123', 'CUSTOMER', 1, NOW());

-- =====================================================
-- 2. CUSTOMERS TABLE
-- =====================================================
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `customer_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20),
  `email` varchar(100),
  `user_id` int,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample customers
INSERT INTO `customers` (`full_name`, `phone`, `email`, `user_id`, `created_at`) VALUES
('Mike Customer', '555-0101', 'mike@email.com', 4, NOW()),
('David Customer', '555-0102', 'david@email.com', 5, NOW()),
('James Client', '555-0103', 'james@email.com', NULL, NOW());

-- =====================================================
-- 3. EMPLOYEES TABLE
-- =====================================================
DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
  `employee_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20),
  `position` varchar(50) DEFAULT 'Barber',
  `salary` decimal(10, 2) DEFAULT 0,
  `hire_date` date,
  `user_id` int,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`employee_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample employees
INSERT INTO `employees` (`full_name`, `phone`, `position`, `salary`, `hire_date`, `user_id`, `created_at`) VALUES
('John Barber Employee', '555-0201', 'Master Barber', 2500.00, '2025-01-15', 2, NOW()),
('Sarah Barber Employee', '555-0202', 'Senior Barber', 2300.00, '2025-02-01', 3, NOW());

-- =====================================================
-- 4. APPOINTMENTS TABLE
-- =====================================================
DROP TABLE IF EXISTS `appointments`;
CREATE TABLE `appointments` (
  `appointment_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `appointment_date` date NOT NULL,
  `time_slot` varchar(10) NOT NULL,
  `status` enum('SCHEDULED','COMPLETED','CANCELLED','NO_SHOW') DEFAULT 'SCHEDULED',
  `notes` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`appointment_id`),
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`customer_id`) ON DELETE CASCADE,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`employee_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample appointments
INSERT INTO `appointments` (`customer_id`, `employee_id`, `appointment_date`, `time_slot`, `status`, `notes`, `created_at`) VALUES
(1, 1, '2026-05-27', '09:00', 'COMPLETED', 'Regular haircut', NOW()),
(2, 2, '2026-05-28', '10:00', 'SCHEDULED', 'Fade cut', NOW()),
(1, 2, '2026-05-29', '14:00', 'SCHEDULED', 'Beard trim', NOW());

-- =====================================================
-- 5. PAYMENTS TABLE
-- =====================================================
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `amount` decimal(10, 2) NOT NULL,
  `payment_date` date NOT NULL,
  `payment_method` varchar(50) DEFAULT 'CASH',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`appointment_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample payments
INSERT INTO `payments` (`appointment_id`, `amount`, `payment_date`, `payment_method`, `created_at`) VALUES
(1, 25.00, '2026-05-27', 'CASH', NOW()),
(1, 25.00, '2026-05-20', 'CASH', NOW()),
(1, 25.00, '2026-05-13', 'CASH', NOW());

-- =====================================================
-- 6. EXPENSES TABLE
-- =====================================================
DROP TABLE IF EXISTS `expenses`;
CREATE TABLE `expenses` (
  `expense_id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(255) NOT NULL,
  `amount` decimal(10, 2) NOT NULL,
  `category` varchar(50) DEFAULT 'Other',
  `expense_date` date NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`expense_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample expenses
INSERT INTO `expenses` (`description`, `amount`, `category`, `expense_date`, `created_at`) VALUES
('Salary payment to John Barber Employee', 2500.00, 'Salary', '2026-05-25', NOW()),
('Salary payment to Sarah Barber Employee', 2300.00, 'Salary', '2026-05-25', NOW()),
('Monthly rent', 2000.00, 'Rent', '2026-05-01', NOW()),
('Barber equipment maintenance', 150.00, 'Equipment', '2026-05-20', NOW()),
('Cleaning supplies', 75.00, 'Supplies', '2026-05-15', NOW());

-- =====================================================
-- 7. SALARIES TABLE
-- =====================================================
DROP TABLE IF EXISTS `salaries`;
CREATE TABLE `salaries` (
  `salary_id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `month` int NOT NULL,
  `year` int NOT NULL,
  `amount` decimal(10, 2) NOT NULL,
  `paid_date` date,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`salary_id`),
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`employee_id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_month_year_employee` (`employee_id`, `month`, `year`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample salaries
INSERT INTO `salaries` (`employee_id`, `month`, `year`, `amount`, `paid_date`, `created_at`) VALUES
(1, 5, 2026, 2500.00, '2026-05-25', NOW()),
(2, 5, 2026, 2300.00, '2026-05-25', NOW()),
(1, 4, 2026, 2500.00, '2026-04-25', NOW()),
(2, 4, 2026, 2300.00, '2026-04-25', NOW());

-- =====================================================
-- 8. COMPLAINTS TABLE
-- =====================================================
DROP TABLE IF EXISTS `complaints`;
CREATE TABLE `complaints` (
  `complaint_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `role` varchar(20) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` enum('OPEN','IN_PROGRESS','RESOLVED','CLOSED') DEFAULT 'OPEN',
  `reply` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`complaint_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample complaints
INSERT INTO `complaints` (`user_id`, `role`, `subject`, `message`, `status`, `reply`, `created_at`) VALUES
(4, 'CUSTOMER', 'Long wait time', 'Had to wait 30 minutes for my appointment', 'RESOLVED', 'We apologize for the inconvenience. We have adjusted our scheduling.', NOW()),
(2, 'EMPLOYEE', 'Schedule conflict', 'Unable to work on certain days', 'IN_PROGRESS', NULL, NOW());

-- =====================================================
-- 9. INCOME TABLE (for non-appointment revenue)
-- =====================================================
DROP TABLE IF EXISTS `income`;
CREATE TABLE `income` (
  `income_id` int NOT NULL AUTO_INCREMENT,
  `source` varchar(100) NOT NULL,
  `amount` decimal(10, 2) NOT NULL,
  `description` text,
  `category` varchar(50),
  `payment_method` varchar(50),
  `income_date` date NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`income_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample income
INSERT INTO `income` (`source`, `amount`, `description`, `category`, `payment_method`, `income_date`, `created_at`) VALUES
('Walk-ins', 100.00, 'Walk-in haircuts', 'Services', 'CASH', '2026-05-20', NOW()),
('Product Sales', 50.00, 'Hair products sold', 'Retail', 'CARD', '2026-05-21', NOW());

-- =====================================================
-- SUMMARY OF TABLES
-- =====================================================
-- users (5 records): owner, 2 employees, 2 customers
-- customers (3 records)
-- employees (2 records)
-- appointments (3 records)
-- payments (3 records)
-- expenses (5 records)
-- salaries (4 records)
-- complaints (2 records)
-- income (2 records)
-- =====================================================
