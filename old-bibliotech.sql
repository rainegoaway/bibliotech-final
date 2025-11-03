-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 29, 2025 at 03:30 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bibliotech`
--

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `isbn` varchar(13) DEFAULT NULL,
  `qr_code` varchar(255) NOT NULL,
  `genre` varchar(100) DEFAULT NULL,
  `subjects` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`subjects`)),
  `publication_year` int(11) DEFAULT NULL,
  `publisher` varchar(255) DEFAULT NULL,
  `edition` varchar(50) DEFAULT NULL,
  `pages` int(11) DEFAULT NULL,
  `synopsis` text DEFAULT NULL,
  `cover_image_url` text DEFAULT NULL,
  `shelf_location` varchar(50) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `status` enum('available','borrowed','reserved','maintenance') DEFAULT 'available',
  `total_borrows` int(11) DEFAULT 0,
  `current_borrower_id` int(11) DEFAULT NULL,
  `added_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`id`, `title`, `author`, `isbn`, `qr_code`, `genre`, `subjects`, `publication_year`, `publisher`, `edition`, `pages`, `synopsis`, `cover_image_url`, `shelf_location`, `category`, `status`, `total_borrows`, `current_borrower_id`, `added_date`, `updated_at`) VALUES
(1, 'Introduction to Algorithms', 'Thomas H. Cormen', '9780262033848', 'BOOK001', 'Computer Science', '[\"Programming\", \"Algorithms\"]', 2009, NULL, NULL, NULL, 'A comprehensive textbook on algorithms and data structures.', NULL, 'A-101', NULL, 'available', 0, NULL, '2025-10-26 15:14:01', '2025-10-26 15:14:01'),
(2, 'Clean Code', 'Robert C. Martin', '9780132350884', 'BOOK002', 'Software Engineering', '[\"Programming\", \"Software Development\"]', 2008, NULL, NULL, NULL, 'A handbook of agile software craftsmanship.', NULL, 'A-102', NULL, 'available', 0, NULL, '2025-10-26 15:14:01', '2025-10-26 15:14:01'),
(3, 'The Pragmatic Programmer', 'David Thomas', '9780135957059', 'BOOK003', 'Software Engineering', '[\"Programming\"]', 2019, NULL, NULL, NULL, 'Your journey to mastery.', NULL, 'A-103', NULL, 'available', 0, NULL, '2025-10-26 15:14:01', '2025-10-26 15:14:01'),
(4, 'Database System Concepts', 'Abraham Silberschatz', '9780078022159', 'BOOK004', 'Computer Science', '[\"Database\", \"SQL\"]', 2019, NULL, NULL, NULL, 'Comprehensive database concepts and design.', NULL, 'A-104', NULL, 'available', 0, NULL, '2025-10-26 15:14:01', '2025-10-26 15:14:01'),
(5, 'Artificial Intelligence: A Modern Approach', 'Stuart Russell', '9780134610993', 'BOOK005', 'Computer Science', '[\"AI\", \"Machine Learning\"]', 2020, NULL, NULL, NULL, 'The leading textbook in Artificial Intelligence.', NULL, 'A-105', NULL, 'available', 0, NULL, '2025-10-26 15:14:01', '2025-10-26 15:14:01');

-- --------------------------------------------------------

--
-- Table structure for table `borrows`
--

CREATE TABLE `borrows` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `borrowed_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `due_date` timestamp NOT NULL DEFAULT (current_timestamp() + interval 3 day),
  `returned_date` timestamp NULL DEFAULT NULL,
  `renewal_count` int(11) DEFAULT 0,
  `last_renewed_date` timestamp NULL DEFAULT NULL,
  `status` enum('active','returned','overdue') DEFAULT 'active',
  `librarian_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `borrows`
--
DELIMITER $$
CREATE TRIGGER `update_book_on_borrow` AFTER INSERT ON `borrows` FOR EACH ROW BEGIN
    UPDATE books 
    SET status = 'borrowed', 
        current_borrower_id = NEW.user_id,
        total_borrows = total_borrows + 1
    WHERE id = NEW.book_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_book_on_return` AFTER UPDATE ON `borrows` FOR EACH ROW BEGIN
    IF NEW.status = 'returned' AND OLD.status != 'returned' THEN
        -- Check if there's a pending reservation
        IF EXISTS (SELECT 1 FROM reservations WHERE book_id = NEW.book_id AND status = 'pending') THEN
            UPDATE books SET status = 'reserved', current_borrower_id = NULL WHERE id = NEW.book_id;
            UPDATE reservations 
            SET status = 'ready', 
                claim_deadline = DATE_ADD(NOW(), INTERVAL 3 DAY)
            WHERE book_id = NEW.book_id AND status = 'pending'
            LIMIT 1;
        ELSE
            UPDATE books SET status = 'available', current_borrower_id = NULL WHERE id = NEW.book_id;
        END IF;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `fines`
--

CREATE TABLE `fines` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `borrow_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `reason` text DEFAULT NULL,
  `days_overdue` int(11) DEFAULT NULL,
  `is_paid` tinyint(1) DEFAULT 0,
  `paid_date` timestamp NULL DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('due_date','overdue','fine','reservation','new_book','renewal') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `related_book_id` int(11) DEFAULT NULL,
  `related_borrow_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reading_stats`
--

CREATE TABLE `reading_stats` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `books_read_count` int(11) DEFAULT 0,
  `current_streak` int(11) DEFAULT 0,
  `longest_streak` int(11) DEFAULT 0,
  `total_reading_time` int(11) DEFAULT 0,
  `last_activity_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reading_stats`
--

INSERT INTO `reading_stats` (`id`, `user_id`, `books_read_count`, `current_streak`, `longest_streak`, `total_reading_time`, `last_activity_date`, `created_at`, `updated_at`) VALUES
(1, 2, 0, 0, 0, 0, NULL, '2025-10-26 15:14:01', '2025-10-26 15:14:01');

-- --------------------------------------------------------

--
-- Table structure for table `reservations`
--

CREATE TABLE `reservations` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `reserved_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `claim_deadline` timestamp NULL DEFAULT NULL,
  `claimed_date` timestamp NULL DEFAULT NULL,
  `status` enum('pending','ready','claimed','cancelled','expired') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `saved_searches`
--

CREATE TABLE `saved_searches` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `search_name` varchar(100) NOT NULL,
  `search_query` text NOT NULL,
  `qr_code` varchar(255) NOT NULL,
  `use_count` int(11) DEFAULT 0,
  `last_used` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `school_id` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` enum('student','teacher','admin') NOT NULL DEFAULT 'student',
  `course` varchar(100) DEFAULT NULL,
  `program` varchar(100) DEFAULT NULL,
  `year_level` int(11) DEFAULT NULL,
  `subjects` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`subjects`)),
  `preferred_genres` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`preferred_genres`)),
  `preference_tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`preference_tags`)),
  `is_active` tinyint(1) DEFAULT 1,
  `is_first_login` tinyint(1) DEFAULT 1,
  `has_overdue_books` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `school_id`, `password_hash`, `name`, `email`, `role`, `course`, `program`, `year_level`, `subjects`, `preferred_genres`, `preference_tags`, `is_active`, `is_first_login`, `has_overdue_books`, `created_at`, `updated_at`, `last_login`) VALUES
(1, 'ADMIN001', '$2b$10$EcFjNP6eKgRT2v8e0XrghedWNV0cZSTezYRLj85PeGPwkP3wVh8bG', 'System Administrator', NULL, 'admin', NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, 0, '2025-10-26 15:14:01', '2025-10-28 15:46:40', '2025-10-28 15:46:40'),
(2, '2021-00001', '$2b$10$wU7kQsim8A8wYGNIPhPhHeF7cLfbdkGsRz1cKJxg58c73Mlwn/U3e', 'Juan Dela Cruz', NULL, 'student', 'Computer Science', 'BSCS', 3, NULL, '[\"Technology\", \"Science Fiction\", \"Programming\"]', NULL, 1, 1, 0, '2025-10-26 15:14:01', '2025-10-28 15:47:00', '2025-10-28 15:47:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `qr_code` (`qr_code`),
  ADD UNIQUE KEY `isbn` (`isbn`),
  ADD KEY `idx_title` (`title`),
  ADD KEY `idx_author` (`author`),
  ADD KEY `idx_genre` (`genre`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_qr_code` (`qr_code`),
  ADD KEY `current_borrower_id` (`current_borrower_id`);

--
-- Indexes for table `borrows`
--
ALTER TABLE `borrows`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_book_id` (`book_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_due_date` (`due_date`);

--
-- Indexes for table `fines`
--
ALTER TABLE `fines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_is_paid` (`is_paid`),
  ADD KEY `borrow_id` (`borrow_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_is_read` (`is_read`),
  ADD KEY `idx_created_date` (`created_date`),
  ADD KEY `related_book_id` (`related_book_id`),
  ADD KEY `related_borrow_id` (`related_borrow_id`);

--
-- Indexes for table `reading_stats`
--
ALTER TABLE `reading_stats`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_active_reservation` (`book_id`,`status`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_book_id` (`book_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `saved_searches`
--
ALTER TABLE `saved_searches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `qr_code` (`qr_code`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `school_id` (`school_id`),
  ADD KEY `idx_school_id` (`school_id`),
  ADD KEY `idx_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `borrows`
--
ALTER TABLE `borrows`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fines`
--
ALTER TABLE `fines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reading_stats`
--
ALTER TABLE `reading_stats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `saved_searches`
--
ALTER TABLE `saved_searches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `books`
--
ALTER TABLE `books`
  ADD CONSTRAINT `books_ibfk_1` FOREIGN KEY (`current_borrower_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `borrows`
--
ALTER TABLE `borrows`
  ADD CONSTRAINT `borrows_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `borrows_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `fines`
--
ALTER TABLE `fines`
  ADD CONSTRAINT `fines_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fines_ibfk_2` FOREIGN KEY (`borrow_id`) REFERENCES `borrows` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`related_book_id`) REFERENCES `books` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`related_borrow_id`) REFERENCES `borrows` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `reading_stats`
--
ALTER TABLE `reading_stats`
  ADD CONSTRAINT `reading_stats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `saved_searches`
--
ALTER TABLE `saved_searches`
  ADD CONSTRAINT `saved_searches_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
