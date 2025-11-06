-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 03, 2025 at 09:55 AM
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
(5, 'Artificial Intelligence: A Modern Approach', 'Stuart Russell', '9780134610993', 'BOOK005', 'Computer Science', '[\"AI\", \"Machine Learning\"]', 2020, NULL, NULL, NULL, 'The leading textbook in Artificial Intelligence.', NULL, 'A-105', NULL, 'borrowed', 3, 6, '2025-10-26 15:14:01', '2025-11-03 06:42:27'),
(6, 'Book Sample', 'Example Author', NULL, 'BOOK-1762068368221-7720', NULL, NULL, 2025, NULL, NULL, NULL, 'Lorem ipsum.', NULL, 'B-301', NULL, 'available', 0, NULL, '2025-11-02 07:26:08', '2025-11-02 07:26:08');

-- --------------------------------------------------------

--
-- Table structure for table `book_genres`
--

CREATE TABLE `book_genres` (
  `id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `genre_id` int(11) NOT NULL,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `book_genres`
--

INSERT INTO `book_genres` (`id`, `book_id`, `genre_id`, `added_at`) VALUES
(4, 6, 4, '2025-11-02 07:26:25'),
(5, 6, 25, '2025-11-02 07:26:25');

-- --------------------------------------------------------

--
-- Table structure for table `book_subjects`
--

CREATE TABLE `book_subjects` (
  `id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `book_subjects`
--

INSERT INTO `book_subjects` (`id`, `book_id`, `subject_id`, `added_at`) VALUES
(3, 6, 9, '2025-11-02 07:26:25'),
(4, 6, 19, '2025-11-02 07:26:25');

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
-- Dumping data for table `borrows`
--

INSERT INTO `borrows` (`id`, `user_id`, `book_id`, `borrowed_date`, `due_date`, `returned_date`, `renewal_count`, `last_renewed_date`, `status`, `librarian_notes`, `created_at`, `updated_at`) VALUES
(1, 6, 5, '2025-11-02 20:19:18', '2025-11-05 20:19:18', '2025-11-02 20:43:33', 0, NULL, 'returned', NULL, '2025-11-02 20:19:18', '2025-11-02 20:43:33'),
(2, 3, 5, '2025-11-02 20:44:31', '2025-11-07 20:44:31', '2025-11-03 06:41:01', 2, '2025-11-02 20:44:36', 'returned', NULL, '2025-11-02 20:44:31', '2025-11-03 06:41:01'),
(3, 6, 5, '2025-11-03 06:42:27', '2025-11-07 06:42:27', NULL, 1, '2025-11-03 06:55:57', 'active', NULL, '2025-11-03 06:42:27', '2025-11-03 06:55:57');

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

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `code`, `name`, `description`, `is_active`, `created_at`) VALUES
(1, 'BSIT', 'Bachelor of Science in Information Technology', 'IT program focused on software development and systems', 1, '2025-10-29 07:13:13'),
(2, 'BSCS', 'Bachelor of Science in Computer Science', 'CS program focused on algorithms and theory', 1, '2025-10-29 07:13:13'),
(3, 'BSBA', 'Bachelor of Science in Business Administration', 'Business management and administration', 1, '2025-10-29 07:13:13'),
(4, 'BSED', 'Bachelor of Secondary Education', 'Teacher education program', 1, '2025-10-29 07:13:13');

-- --------------------------------------------------------

--
-- Table structure for table `course_subjects`
--

CREATE TABLE `course_subjects` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `year_level` int(11) NOT NULL,
  `semester` int(11) DEFAULT NULL,
  `is_required` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course_subjects`
--

INSERT INTO `course_subjects` (`id`, `course_id`, `subject_id`, `year_level`, `semester`, `is_required`, `created_at`) VALUES
(1, 1, 1, 1, 1, 1, '2025-10-29 07:13:13'),
(2, 1, 2, 1, 1, 1, '2025-10-29 07:13:13'),
(3, 1, 19, 1, 1, 1, '2025-10-29 07:13:13'),
(4, 1, 20, 1, 1, 1, '2025-10-29 07:13:13'),
(5, 1, 23, 1, 1, 1, '2025-10-29 07:13:13'),
(6, 1, 3, 2, 1, 1, '2025-10-29 07:13:13'),
(7, 1, 4, 2, 1, 1, '2025-10-29 07:13:13'),
(8, 1, 21, 2, 1, 1, '2025-10-29 07:13:13'),
(9, 1, 5, 3, 1, 1, '2025-10-29 07:13:13'),
(10, 1, 6, 3, 1, 1, '2025-10-29 07:13:13'),
(11, 1, 22, 3, 1, 1, '2025-10-29 07:13:13'),
(12, 1, 7, 4, 1, 1, '2025-10-29 07:13:13'),
(13, 1, 8, 4, 2, 1, '2025-10-29 07:13:13'),
(14, 2, 1, 1, 1, 1, '2025-10-29 07:13:13'),
(15, 2, 2, 1, 1, 1, '2025-10-29 07:13:13'),
(16, 2, 9, 1, 1, 1, '2025-10-29 07:13:13'),
(17, 2, 10, 2, 1, 1, '2025-10-29 07:13:13'),
(18, 2, 11, 3, 1, 1, '2025-10-29 07:13:13'),
(19, 2, 12, 4, 1, 1, '2025-10-29 07:13:13'),
(20, 3, 13, 1, 1, 1, '2025-10-29 07:13:13'),
(21, 3, 14, 1, 1, 1, '2025-10-29 07:13:13'),
(22, 3, 15, 2, 1, 1, '2025-10-29 07:13:13'),
(23, 3, 16, 2, 1, 1, '2025-10-29 07:13:13'),
(24, 3, 17, 3, 1, 1, '2025-10-29 07:13:13'),
(25, 3, 18, 4, 1, 1, '2025-10-29 07:13:13');

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
-- Table structure for table `genres`
--

CREATE TABLE `genres` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `color` varchar(7) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `genres`
--

INSERT INTO `genres` (`id`, `name`, `description`, `icon`, `color`, `is_active`, `created_at`) VALUES
(1, 'Science', 'Scientific research, experiments, and discoveries', '🔬', '#3498db', 1, '2025-10-29 07:25:29'),
(2, 'Technology', 'Programming, IT, computer science, and tech innovation', '💻', '#9b59b6', 1, '2025-10-29 07:25:29'),
(3, 'Mathematics', 'Mathematical concepts, theories, and applications', '📐', '#e67e22', 1, '2025-10-29 07:25:29'),
(4, 'Engineering', 'Engineering principles, design, and applications', '⚙️', '#34495e', 1, '2025-10-29 07:25:29'),
(5, 'Business', 'Business management, entrepreneurship, and economics', '💼', '#2ecc71', 1, '2025-10-29 07:25:29'),
(6, 'Medicine', 'Medical science, healthcare, and anatomy', '⚕️', '#e74c3c', 1, '2025-10-29 07:25:29'),
(7, 'Law', 'Legal studies, jurisprudence, and legislation', '⚖️', '#95a5a6', 1, '2025-10-29 07:25:29'),
(8, 'Education', 'Teaching methods, pedagogy, and learning theories', '🎓', '#1abc9c', 1, '2025-10-29 07:25:29'),
(9, 'Fantasy', 'Magical worlds, mythical creatures, and epic adventures', '🧙', '#9c27b0', 1, '2025-10-29 07:25:29'),
(10, 'Science Fiction', 'Future technology, space exploration, and alternate realities', '🚀', '#2196f3', 1, '2025-10-29 07:25:29'),
(11, 'Mystery', 'Detective stories, crime solving, and suspense', '🔍', '#607d8b', 1, '2025-10-29 07:25:29'),
(12, 'Romance', 'Love stories, relationships, and emotional journeys', '💕', '#e91e63', 1, '2025-10-29 07:25:29'),
(13, 'Horror', 'Scary stories, supernatural events, and psychological thrillers', '👻', '#000000', 1, '2025-10-29 07:25:29'),
(14, 'Adventure', 'Action-packed journeys, exploration, and quests', '🗺️', '#ff9800', 1, '2025-10-29 07:25:29'),
(15, 'Historical Fiction', 'Stories set in the past with historical accuracy', '📜', '#8d6e63', 1, '2025-10-29 07:25:29'),
(16, 'Biography', 'Life stories of real people and historical figures', '👤', '#795548', 1, '2025-10-29 07:25:29'),
(17, 'Self-Help', 'Personal development, motivation, and life improvement', '🌱', '#4caf50', 1, '2025-10-29 07:25:29'),
(18, 'History', 'Historical events, periods, and civilizations', '🏛️', '#9e9e9e', 1, '2025-10-29 07:25:29'),
(19, 'Philosophy', 'Philosophical thought, ethics, and existential questions', '🤔', '#673ab7', 1, '2025-10-29 07:25:29'),
(20, 'Psychology', 'Human behavior, mental processes, and therapy', '🧠', '#00bcd4', 1, '2025-10-29 07:25:29'),
(21, 'Art', 'Visual arts, design, and creative expression', '🎨', '#ff5722', 1, '2025-10-29 07:25:29'),
(22, 'Music', 'Music theory, history, and musical culture', '🎵', '#3f51b5', 1, '2025-10-29 07:25:29'),
(23, 'Sports', 'Athletics, fitness, and competitive sports', '⚽', '#009688', 1, '2025-10-29 07:25:29'),
(24, 'Travel', 'Travel guides, cultural exploration, and adventures', '✈️', '#ffc107', 1, '2025-10-29 07:25:29'),
(25, 'Graphic Novel', 'Visual storytelling with illustrations', '📚', '#ff6f00', 1, '2025-10-29 07:25:29'),
(26, 'Poetry', 'Poems, verses, and poetic literature', '✍️', '#8e24aa', 1, '2025-10-29 07:25:29'),
(27, 'Drama', 'Plays, theatrical works, and dramatic literature', '🎭', '#d32f2f', 1, '2025-10-29 07:25:29'),
(28, 'Comics', 'Comic books and sequential art', '💥', '#ffeb3b', 1, '2025-10-29 07:25:29'),
(29, 'Manga', 'Japanese comics and graphic novels', '🇯🇵', '#f44336', 1, '2025-10-29 07:25:29');

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
  `reserved_date` datetime NOT NULL,
  `ready_date` datetime DEFAULT NULL,
  `completed_date` datetime DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `status` enum('pending','ready','completed','cancelled','expired') DEFAULT 'pending',
  `fulfilled_date` datetime DEFAULT NULL,
  `cancelled_date` datetime DEFAULT NULL,
  `expired_date` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reservations`
--

INSERT INTO `reservations` (`id`, `user_id`, `book_id`, `reserved_date`, `ready_date`, `completed_date`, `expires_at`, `status`, `fulfilled_date`, `cancelled_date`, `expired_date`, `created_at`) VALUES
(1, 6, 5, '2025-11-03 11:32:02', NULL, NULL, '2025-11-06 11:32:02', 'cancelled', NULL, '2025-11-03 14:42:03', NULL, '2025-11-03 03:32:02');

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
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`id`, `code`, `name`, `description`, `category`, `is_active`, `created_at`) VALUES
(1, 'IT101', 'Introduction to Computing', NULL, 'Core', 1, '2025-10-29 07:13:13'),
(2, 'IT102', 'Programming Fundamentals', NULL, 'Core', 1, '2025-10-29 07:13:13'),
(3, 'IT201', 'Data Structures and Algorithms', NULL, 'Major', 1, '2025-10-29 07:13:13'),
(4, 'IT202', 'Database Management Systems', NULL, 'Major', 1, '2025-10-29 07:13:13'),
(5, 'IT301', 'Web Development', NULL, 'Major', 1, '2025-10-29 07:13:13'),
(6, 'IT302', 'Mobile App Development', NULL, 'Major', 1, '2025-10-29 07:13:13'),
(7, 'IT401', 'System Analysis and Design', NULL, 'Major', 1, '2025-10-29 07:13:13'),
(8, 'IT402', 'Capstone Project', NULL, 'Major', 1, '2025-10-29 07:13:13'),
(9, 'CS101', 'Discrete Mathematics', NULL, 'Core', 1, '2025-10-29 07:13:13'),
(10, 'CS201', 'Computer Architecture', NULL, 'Major', 1, '2025-10-29 07:13:13'),
(11, 'CS301', 'Artificial Intelligence', NULL, 'Major', 1, '2025-10-29 07:13:13'),
(12, 'CS401', 'Machine Learning', NULL, 'Major', 1, '2025-10-29 07:13:13'),
(13, 'BA101', 'Principles of Management', NULL, 'Core', 1, '2025-10-29 07:13:13'),
(14, 'BA102', 'Financial Accounting', NULL, 'Core', 1, '2025-10-29 07:13:13'),
(15, 'BA201', 'Marketing Management', NULL, 'Major', 1, '2025-10-29 07:13:13'),
(16, 'BA202', 'Human Resource Management', NULL, 'Major', 1, '2025-10-29 07:13:13'),
(17, 'BA301', 'Business Law', NULL, 'Major', 1, '2025-10-29 07:13:13'),
(18, 'BA401', 'Strategic Management', NULL, 'Major', 1, '2025-10-29 07:13:13'),
(19, 'GE101', 'English Communication', NULL, 'Core', 1, '2025-10-29 07:13:13'),
(20, 'GE102', 'Mathematics in the Modern World', NULL, 'Core', 1, '2025-10-29 07:13:13'),
(21, 'GE103', 'Philippine History', NULL, 'Core', 1, '2025-10-29 07:13:13'),
(22, 'GE104', 'Rizal\'s Life and Works', NULL, 'Core', 1, '2025-10-29 07:13:13'),
(23, 'PE101', 'Physical Education 1', NULL, 'Minor', 1, '2025-10-29 07:13:13'),
(24, 'NSTP1', 'National Service Training Program 1', NULL, 'Minor', 1, '2025-10-29 07:13:13');

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
(1, 'ADMIN001', '$2b$10$EcFjNP6eKgRT2v8e0XrghedWNV0cZSTezYRLj85PeGPwkP3wVh8bG', 'System Administrator', NULL, 'admin', NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, 0, '2025-10-26 15:14:01', '2025-11-03 06:40:47', '2025-11-03 06:40:47'),
(2, '2021-00001', '$2b$10$wU7kQsim8A8wYGNIPhPhHeF7cLfbdkGsRz1cKJxg58c73Mlwn/U3e', 'Juan Dela Cruz', NULL, 'student', 'Computer Science', 'BSCS', 3, NULL, '[\"Technology\", \"Science Fiction\", \"Programming\"]', NULL, 1, 1, 0, '2025-10-26 15:14:01', '2025-10-29 08:35:20', '2025-10-29 08:35:20'),
(3, '2021-00002', '$2b$10$6AYzR562sEu.7xwdzqew.Op.yNa4rUA4tCmxjLuN5RKdf8BFL/jnu', 'Marie Elena', 'marieelena@gmail.com', 'student', 'BSBA', NULL, 2, NULL, NULL, NULL, 1, 0, 0, '2025-10-29 09:12:51', '2025-11-02 20:44:19', '2025-11-02 20:44:19'),
(5, '2021-00003', '$2b$10$659PCz2A2x8YTnQXPJjOc.bTNDI667AkCp5OVX4xXY4aLD25lVnOW', 'ABCD EFG', 'abcdefg@gmail.com', 'student', 'BSIT', NULL, 4, NULL, NULL, NULL, 1, 0, 0, '2025-11-02 13:38:24', '2025-11-02 18:01:27', '2025-11-02 17:36:33'),
(6, '123', '$2b$10$JpBePXHQSvY/mp/q/7BM/ONq7SCVvZirMve/yFcad/R3gWlDW.MVS', 'new', 'new@gmail.com', 'student', 'BSBA', NULL, 1, NULL, NULL, NULL, 1, 0, 0, '2025-11-02 18:01:46', '2025-11-03 08:50:39', '2025-11-03 08:50:39');

-- --------------------------------------------------------

--
-- Table structure for table `user_genres`
--

CREATE TABLE `user_genres` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `genre_id` int(11) NOT NULL,
  `selected_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_genres`
--

INSERT INTO `user_genres` (`id`, `user_id`, `genre_id`, `selected_at`) VALUES
(1, 5, 21, '2025-11-02 13:54:58'),
(2, 5, 14, '2025-11-02 13:54:58'),
(3, 5, 16, '2025-11-02 13:54:58'),
(7, 6, 14, '2025-11-02 18:27:01'),
(8, 6, 21, '2025-11-02 18:27:01'),
(9, 6, 16, '2025-11-02 18:27:01'),
(10, 6, 5, '2025-11-02 18:27:01'),
(11, 6, 28, '2025-11-02 18:27:01');

--
-- Triggers `user_genres`
--
DELIMITER $$
CREATE TRIGGER `enforce_max_genres_per_user` BEFORE INSERT ON `user_genres` FOR EACH ROW BEGIN
  DECLARE genre_count INT;
  
  SELECT COUNT(*) INTO genre_count
  FROM user_genres
  WHERE user_id = NEW.user_id;
  
  IF genre_count >= 5 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'User cannot have more than 5 genre preferences';
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `user_subjects`
--

CREATE TABLE `user_subjects` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_subjects`
--

INSERT INTO `user_subjects` (`id`, `user_id`, `subject_id`, `assigned_at`) VALUES
(8, 3, 15, '2025-11-01 17:23:28'),
(9, 3, 16, '2025-11-01 17:23:28'),
(20, 5, 7, '2025-11-02 18:01:27'),
(21, 5, 8, '2025-11-02 18:01:27'),
(23, 6, 13, '2025-11-02 18:01:46'),
(24, 6, 14, '2025-11-02 18:01:46');

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
-- Indexes for table `book_genres`
--
ALTER TABLE `book_genres`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_book_genre` (`book_id`,`genre_id`),
  ADD KEY `idx_book_genres_book` (`book_id`),
  ADD KEY `idx_book_genres_genre` (`genre_id`);

--
-- Indexes for table `book_subjects`
--
ALTER TABLE `book_subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_book_subject` (`book_id`,`subject_id`),
  ADD KEY `idx_book_subjects_book` (`book_id`),
  ADD KEY `idx_book_subjects_subject` (`subject_id`);

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
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `course_subjects`
--
ALTER TABLE `course_subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_course_subject` (`course_id`,`subject_id`,`year_level`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `idx_course_subjects_course` (`course_id`),
  ADD KEY `idx_course_subjects_year` (`year_level`);

--
-- Indexes for table `fines`
--
ALTER TABLE `fines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_is_paid` (`is_paid`),
  ADD KEY `borrow_id` (`borrow_id`);

--
-- Indexes for table `genres`
--
ALTER TABLE `genres`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

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
  ADD KEY `idx_user_reservations` (`user_id`,`status`),
  ADD KEY `idx_book_reservations` (`book_id`,`status`);

--
-- Indexes for table `saved_searches`
--
ALTER TABLE `saved_searches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `qr_code` (`qr_code`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_subjects_category` (`category`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `school_id` (`school_id`),
  ADD KEY `idx_school_id` (`school_id`),
  ADD KEY `idx_role` (`role`);

--
-- Indexes for table `user_genres`
--
ALTER TABLE `user_genres`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_genre` (`user_id`,`genre_id`),
  ADD KEY `idx_user_genres_user` (`user_id`),
  ADD KEY `idx_user_genres_genre` (`genre_id`);

--
-- Indexes for table `user_subjects`
--
ALTER TABLE `user_subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_subject` (`user_id`,`subject_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `idx_user_subjects_user` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `book_genres`
--
ALTER TABLE `book_genres`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `book_subjects`
--
ALTER TABLE `book_subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `borrows`
--
ALTER TABLE `borrows`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `course_subjects`
--
ALTER TABLE `course_subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `fines`
--
ALTER TABLE `fines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `genres`
--
ALTER TABLE `genres`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `saved_searches`
--
ALTER TABLE `saved_searches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `user_genres`
--
ALTER TABLE `user_genres`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `user_subjects`
--
ALTER TABLE `user_subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `books`
--
ALTER TABLE `books`
  ADD CONSTRAINT `books_ibfk_1` FOREIGN KEY (`current_borrower_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `book_genres`
--
ALTER TABLE `book_genres`
  ADD CONSTRAINT `book_genres_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `book_genres_ibfk_2` FOREIGN KEY (`genre_id`) REFERENCES `genres` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `book_subjects`
--
ALTER TABLE `book_subjects`
  ADD CONSTRAINT `book_subjects_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `book_subjects_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `borrows`
--
ALTER TABLE `borrows`
  ADD CONSTRAINT `borrows_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `borrows_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_subjects`
--
ALTER TABLE `course_subjects`
  ADD CONSTRAINT `course_subjects_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_subjects_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

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

--
-- Constraints for table `user_genres`
--
ALTER TABLE `user_genres`
  ADD CONSTRAINT `user_genres_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_genres_ibfk_2` FOREIGN KEY (`genre_id`) REFERENCES `genres` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_subjects`
--
ALTER TABLE `user_subjects`
  ADD CONSTRAINT `user_subjects_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_subjects_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
