-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 06, 2025 at 01:41 PM
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
(5, 'Artificial Intelligence: A Modern Approach', 'Stuart Russell', '9780134610993', 'BOOK005', 'Computer Science', '[\"AI\", \"Machine Learning\"]', 2020, NULL, NULL, NULL, 'The leading textbook in Artificial Intelligence.', NULL, 'A-105', NULL, 'available', 12, NULL, '2025-10-26 15:14:01', '2025-11-06 06:00:43'),
(6, 'Book Sample', 'Example Author', NULL, 'BOOK-1762068368221-7720', NULL, NULL, 2025, NULL, NULL, NULL, 'Lorem ipsum.', NULL, 'B-301', NULL, 'available', 8, NULL, '2025-11-02 07:26:08', '2025-11-06 10:18:44'),
(11, 'Data Structures and Algorithms in Python', 'Michael T. Goodrich', '9781118290279', 'BOOK011', 'Computer Science', '[\"Data Structures\", \"Python\", \"Algorithms\"]', 2013, 'Wiley', '1st', 768, 'Comprehensive guide to data structures and algorithms using Python programming language.', NULL, 'A-102', NULL, 'available', 0, NULL, '2025-11-06 11:48:04', '2025-11-06 11:48:04'),
(12, 'Introduction to Database Systems', 'C.J. Date', '9780321197849', 'BOOK012', 'Computer Science', '[\"Databases\", \"SQL\"]', 2019, 'Pearson', '8th', 1024, 'Classic textbook on database management systems and relational database theory.', NULL, 'A-103', NULL, 'available', 0, NULL, '2025-11-06 11:48:04', '2025-11-06 11:48:04'),
(13, 'Web Development with React', 'Robin Wieruch', '9781720043997', 'BOOK013', 'Technology', '[\"Web Development\", \"JavaScript\", \"React\"]', 2021, 'Self-Published', '2nd', 420, 'Modern web development using React framework and JavaScript ecosystem.', NULL, 'A-201', NULL, 'available', 0, NULL, '2025-11-06 11:48:04', '2025-11-06 11:48:04'),
(14, 'Mobile App Development with Flutter', 'Marco L. Napoli', '9781484249710', 'BOOK014', 'Technology', '[\"Mobile Development\", \"Flutter\"]', 2020, 'Apress', '1st', 398, 'Learn cross-platform mobile app development using Flutter and Dart.', NULL, 'A-202', NULL, 'available', 0, NULL, '2025-11-06 11:48:04', '2025-11-06 11:48:04'),
(15, 'Marketing Management', 'Philip Kotler', '9780136009986', 'BOOK015', 'Business', '[\"Marketing\", \"Business Strategy\"]', 2022, 'Pearson', '15th', 720, 'The definitive guide to modern marketing principles and practices.', NULL, 'B-101', NULL, 'available', 0, NULL, '2025-11-06 11:48:04', '2025-11-06 11:48:04'),
(16, 'Human Resource Management', 'Gary Dessler', '9780134739724', 'BOOK016', 'Business', '[\"HR\", \"Management\"]', 2021, 'Pearson', '16th', 752, 'Comprehensive coverage of human resource management concepts and applications.', NULL, 'B-102', NULL, 'available', 0, NULL, '2025-11-06 11:48:04', '2025-11-06 11:48:04'),
(17, 'Financial Accounting Fundamentals', 'John Wild', '9781259916960', 'BOOK017', 'Business', '[\"Accounting\", \"Finance\"]', 2019, 'McGraw-Hill', '7th', 896, 'Introduction to financial accounting principles and reporting.', NULL, 'B-103', NULL, 'available', 0, NULL, '2025-11-06 11:48:04', '2025-11-06 11:48:04'),
(18, 'The Art of Teaching', 'Jay Parini', '9780190269746', 'BOOK018', 'Education', '[\"Teaching\", \"Pedagogy\"]', 2020, 'Oxford', '1st', 256, 'Insights into effective teaching methods and educational philosophy.', NULL, 'C-101', NULL, 'available', 0, NULL, '2025-11-06 11:48:04', '2025-11-06 11:48:04'),
(19, 'Educational Psychology', 'Anita Woolfolk', '9780134532066', 'BOOK019', 'Education', '[\"Psychology\", \"Learning\"]', 2019, 'Pearson', '14th', 672, 'Understanding how students learn and develop in educational settings.', NULL, 'C-102', NULL, 'available', 0, NULL, '2025-11-06 11:48:04', '2025-11-06 11:48:04'),
(20, 'To Kill a Mockingbird', 'Harper Lee', '9780061120084', 'BOOK020', 'Fiction', '[\"Classic Literature\"]', 1960, 'Harper Perennial', 'Modern Classics', 324, 'A classic American novel about racial injustice and childhood innocence.', NULL, 'D-101', NULL, 'available', 0, NULL, '2025-11-06 11:48:04', '2025-11-06 11:48:04'),
(21, '1984 - Edited', 'George Orwell', '9780451524935', 'BOOK021', 'Fiction', '[\"Dystopian\", \"Classic Literature\"]', 1949, 'Signet Classic', 'Reprint', 328, 'A dystopian social science fiction novel about totalitarian surveillance.', NULL, 'D-102', NULL, 'available', 0, NULL, '2025-11-06 11:48:04', '2025-11-06 12:33:25'),
(22, 'The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'BOOK022', 'Fiction', '[\"Classic Literature\", \"Romance\"]', 1925, 'Scribner', 'Reissue', 180, 'A tragic love story set in the Jazz Age of 1920s America.', NULL, 'D-103', NULL, 'available', 0, NULL, '2025-11-06 11:48:04', '2025-11-06 11:48:04'),
(23, 'Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', '9780062316097', 'BOOK023', 'History', '[\"Anthropology\", \"History\"]', 2015, 'Harper', '1st', 464, 'An exploration of human history from the Stone Age to modern times.', NULL, 'E-101', NULL, 'available', 0, NULL, '2025-11-06 11:48:04', '2025-11-06 11:48:04'),
(24, 'Thinking, Fast and Slow', 'Daniel Kahneman', '9780374533557', 'BOOK024', 'Psychology', '[\"Psychology\", \"Decision Making\"]', 2011, 'Farrar, Straus and Giroux', '1st', 499, 'Insights into the two systems that drive the way we think and make decisions.', NULL, 'E-102', NULL, 'available', 0, NULL, '2025-11-06 11:48:04', '2025-11-06 11:48:04'),
(25, 'The Lean Startup', 'Eric Ries', '9780307887894', 'BOOK025', 'Business', '[\"Entrepreneurship\", \"Innovation\"]', 2011, 'Crown Business', '1st', 336, 'How entrepreneurs can build successful businesses through continuous innovation.', NULL, 'B-104', NULL, 'available', 0, NULL, '2025-11-06 11:48:04', '2025-11-06 11:48:04'),
(26, 'Clean Code', 'Robert C. Martin', '9780132350884', 'BOOK026', 'Computer Science', '[\"Programming\", \"Software Engineering\"]', 2008, 'Prentice Hall', '1st', 464, 'A handbook of agile software craftsmanship and best coding practices.', NULL, 'A-104', NULL, 'available', 0, NULL, '2025-11-06 11:48:04', '2025-11-06 11:48:04'),
(27, 'Introduction to Algorithms', 'Thomas H. Cormen', '9780262033848', 'BOOK027', 'Computer Science', '[\"Algorithms\", \"Computer Science\"]', 2009, 'MIT Press', '3rd', 1312, 'Comprehensive introduction to algorithms and data structures.', NULL, 'A-106', NULL, 'available', 0, NULL, '2025-11-06 11:48:04', '2025-11-06 11:48:04'),
(28, 'The Republic', 'Plato', '9780140449143', 'BOOK028', 'Philosophy', '[\"Philosophy\", \"Political Theory\"]', -375, 'Penguin Classics', 'Reprint', 416, 'Ancient Greek philosophical work on justice and the ideal state.', NULL, 'E-103', NULL, 'available', 0, NULL, '2025-11-06 11:48:04', '2025-11-06 11:48:04'),
(29, 'A Brief History of Time', 'Stephen Hawking', '9780553380163', 'BOOK029', 'Science', '[\"Physics\", \"Cosmology\"]', 1988, 'Bantam', '10th Anniversary', 256, 'Exploration of the universe, from the Big Bang to black holes.', NULL, 'F-101', NULL, 'available', 0, NULL, '2025-11-06 11:48:04', '2025-11-06 11:48:04'),
(30, 'The Art of War', 'Sun Tzu', '9781590302255', 'BOOK030', 'History', '[\"Military Strategy\", \"Philosophy\"]', -500, 'Shambhala', 'Reprint', 273, 'Ancient Chinese military treatise on strategy and tactics.', NULL, 'E-104', NULL, 'available', 0, NULL, '2025-11-06 11:48:04', '2025-11-06 11:48:04');

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
(5, 6, 25, '2025-11-02 07:26:25'),
(20, 11, 2, '2025-11-06 11:48:04'),
(21, 11, 3, '2025-11-06 11:48:04'),
(22, 12, 2, '2025-11-06 11:48:04'),
(23, 12, 3, '2025-11-06 11:48:04'),
(24, 13, 2, '2025-11-06 11:48:04'),
(25, 14, 2, '2025-11-06 11:48:04'),
(26, 15, 5, '2025-11-06 11:48:04'),
(27, 16, 5, '2025-11-06 11:48:04'),
(28, 17, 5, '2025-11-06 11:48:04'),
(29, 18, 8, '2025-11-06 11:48:04'),
(30, 19, 8, '2025-11-06 11:48:04'),
(31, 19, 20, '2025-11-06 11:48:04'),
(32, 20, 15, '2025-11-06 11:48:04'),
(35, 22, 12, '2025-11-06 11:48:04'),
(36, 22, 15, '2025-11-06 11:48:04'),
(37, 23, 18, '2025-11-06 11:48:04'),
(38, 24, 20, '2025-11-06 11:48:04'),
(39, 24, 17, '2025-11-06 11:48:04'),
(40, 25, 5, '2025-11-06 11:48:04'),
(41, 26, 2, '2025-11-06 11:48:04'),
(42, 27, 2, '2025-11-06 11:48:04'),
(43, 27, 3, '2025-11-06 11:48:04'),
(44, 28, 19, '2025-11-06 11:48:04'),
(45, 29, 1, '2025-11-06 11:48:04'),
(46, 30, 18, '2025-11-06 11:48:04'),
(47, 30, 19, '2025-11-06 11:48:04'),
(48, 21, 10, '2025-11-06 12:33:25'),
(49, 21, 19, '2025-11-06 12:33:25'),
(50, 21, 11, '2025-11-06 12:33:25'),
(51, 21, 26, '2025-11-06 12:33:25'),
(52, 21, 14, '2025-11-06 12:33:25');

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
(4, 6, 19, '2025-11-02 07:26:25'),
(16, 11, 3, '2025-11-06 11:48:04'),
(17, 12, 4, '2025-11-06 11:48:04'),
(18, 13, 5, '2025-11-06 11:48:04'),
(19, 14, 6, '2025-11-06 11:48:04'),
(20, 15, 15, '2025-11-06 11:48:04'),
(21, 16, 16, '2025-11-06 11:48:04'),
(22, 17, 14, '2025-11-06 11:48:04'),
(23, 18, 19, '2025-11-06 11:48:04'),
(24, 19, 19, '2025-11-06 11:48:04'),
(25, 26, 3, '2025-11-06 11:48:04'),
(26, 26, 2, '2025-11-06 11:48:04'),
(27, 27, 9, '2025-11-06 11:48:04'),
(28, 27, 3, '2025-11-06 11:48:04'),
(29, 21, 26, '2025-11-06 12:33:25'),
(30, 21, 9, '2025-11-06 12:33:25'),
(31, 21, 19, '2025-11-06 12:33:25');

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
(2, 3, 5, '2025-11-02 20:44:31', '2025-11-07 20:44:31', '2025-11-03 06:41:01', 2, '2025-11-02 20:44:36', 'returned', NULL, '2025-11-02 20:44:31', '2025-11-03 06:41:01');

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
(25, 3, 18, 4, 1, 1, '2025-10-29 07:13:13'),
(26, 4, 1, 1, 1, 1, '2025-11-06 11:48:04'),
(27, 4, 19, 1, 1, 1, '2025-11-06 11:48:04'),
(28, 4, 20, 1, 1, 1, '2025-11-06 11:48:04'),
(29, 4, 23, 1, 1, 1, '2025-11-06 11:48:04'),
(30, 4, 25, 1, 1, 1, '2025-11-06 11:48:04'),
(31, 4, 26, 1, 2, 1, '2025-11-06 11:48:04'),
(32, 4, 21, 2, 1, 1, '2025-11-06 11:48:04'),
(33, 4, 27, 2, 1, 1, '2025-11-06 11:48:04'),
(34, 4, 28, 2, 2, 1, '2025-11-06 11:48:04'),
(35, 4, 22, 3, 1, 1, '2025-11-06 11:48:04'),
(36, 4, 29, 3, 1, 1, '2025-11-06 11:48:04'),
(37, 4, 30, 3, 2, 1, '2025-11-06 11:48:04'),
(38, 4, 31, 4, 1, 1, '2025-11-06 11:48:04'),
(39, 4, 32, 4, 2, 1, '2025-11-06 11:48:04'),
(40, 1, 33, 3, 2, 1, '2025-11-06 11:48:04'),
(41, 1, 34, 4, 1, 0, '2025-11-06 11:48:04'),
(42, 2, 35, 3, 1, 1, '2025-11-06 11:48:04'),
(43, 2, 36, 3, 2, 0, '2025-11-06 11:48:04'),
(44, 3, 37, 3, 2, 1, '2025-11-06 11:48:04'),
(45, 3, 38, 4, 1, 0, '2025-11-06 11:48:04');

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
(24, 'NSTP1', 'National Service Training Program 1', NULL, 'Minor', 1, '2025-10-29 07:13:13'),
(25, 'ED101', 'Foundations of Education', 'Introduction to educational theories and practices', 'Core', 1, '2025-11-06 11:48:04'),
(26, 'ED102', 'Child and Adolescent Development', 'Understanding developmental stages of learners', 'Core', 1, '2025-11-06 11:48:04'),
(27, 'ED201', 'Educational Psychology', 'Psychology applied to teaching and learning', 'Major', 1, '2025-11-06 11:48:04'),
(28, 'ED202', 'Curriculum Development', 'Designing and implementing curriculum', 'Major', 1, '2025-11-06 11:48:04'),
(29, 'ED301', 'Assessment and Evaluation', 'Methods of assessing student learning', 'Major', 1, '2025-11-06 11:48:04'),
(30, 'ED302', 'Classroom Management', 'Effective classroom management strategies', 'Major', 1, '2025-11-06 11:48:04'),
(31, 'ED401', 'Teaching Internship', 'Supervised teaching practice', 'Major', 1, '2025-11-06 11:48:04'),
(32, 'ED402', 'Action Research', 'Research methods in education', 'Major', 1, '2025-11-06 11:48:04'),
(33, 'IT303', 'Software Engineering', 'Software development lifecycle and methodologies', 'Major', 1, '2025-11-06 11:48:04'),
(34, 'IT304', 'Network Administration', 'Computer networks and system administration', 'Major', 1, '2025-11-06 11:48:04'),
(35, 'CS302', 'Operating Systems', 'OS concepts, processes, and memory management', 'Major', 1, '2025-11-06 11:48:04'),
(36, 'CS303', 'Computer Graphics', 'Fundamentals of computer graphics and visualization', 'Major', 1, '2025-11-06 11:48:04'),
(37, 'BA302', 'Operations Management', 'Managing business operations and processes', 'Major', 1, '2025-11-06 11:48:04'),
(38, 'BA303', 'Business Analytics', 'Data-driven decision making in business', 'Major', 1, '2025-11-06 11:48:04');

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
(1, 'ADMIN001', '$2b$10$EcFjNP6eKgRT2v8e0XrghedWNV0cZSTezYRLj85PeGPwkP3wVh8bG', 'System Administrator', 'admin@gmail.com', 'admin', NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, 0, '2025-10-26 15:14:01', '2025-11-06 12:39:40', '2025-11-06 12:39:40'),
(2, '2021-00001', '$2b$10$xVR3GcSQG2UEG4drnrsKfuQQqA5cRIJ8CUNQ9z3W39ThgdWl8FQxa', 'Juan Dela Cruz', 'juandelacruz@gmail.com', 'student', 'Computer Science', 'BSCS', 3, NULL, '[\"Technology\", \"Science Fiction\", \"Programming\"]', NULL, 1, 0, 0, '2025-10-26 15:14:01', '2025-11-06 10:33:16', '2025-11-06 09:12:29'),
(3, '2021-00002', '$2b$10$6AYzR562sEu.7xwdzqew.Op.yNa4rUA4tCmxjLuN5RKdf8BFL/jnu', 'Marie Elena', 'marieelena@gmail.com', 'student', 'BSBA', NULL, 2, NULL, NULL, NULL, 1, 0, 0, '2025-10-29 09:12:51', '2025-11-02 20:44:19', '2025-11-02 20:44:19'),
(8, '2025-00001', '$2b$10$zMaxkPNTtsqTTuLePrY0yOVC6YPcPrbKIF0RI0PePdHthG5Qah01i', 'Jose Rizal', 'joserizal@my.jru.edu', 'student', 'BSIT', NULL, 3, NULL, NULL, NULL, 1, 0, 0, '2025-11-06 12:12:45', '2025-11-06 12:38:23', '2025-11-06 12:38:23'),
(9, '2025-00002', '$2b$10$KpTh9sF8fRhUgB8aFP6szOHnaQCO0PTpi8cBms.O7FQq/MGw1d74K', 'Sample Student', 'sample@gmail.com', 'student', 'BSCS', NULL, 2, NULL, NULL, NULL, 1, 0, 0, '2025-11-06 12:31:50', '2025-11-06 12:40:45', '2025-11-06 12:40:45');

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
(38, 8, 5, '2025-11-06 12:12:45'),
(39, 8, 6, '2025-11-06 12:12:45'),
(40, 8, 22, '2025-11-06 12:12:45'),
(41, 8, 33, '2025-11-06 12:12:45'),
(45, 9, 10, '2025-11-06 12:31:50');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `book_genres`
--
ALTER TABLE `book_genres`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `book_subjects`
--
ALTER TABLE `book_subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `borrows`
--
ALTER TABLE `borrows`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `course_subjects`
--
ALTER TABLE `course_subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `reading_stats`
--
ALTER TABLE `reading_stats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `saved_searches`
--
ALTER TABLE `saved_searches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `user_genres`
--
ALTER TABLE `user_genres`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `user_subjects`
--
ALTER TABLE `user_subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

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
