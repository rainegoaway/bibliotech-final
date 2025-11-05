# Gemini AI Assistant - Conversation Summary

## User Request: Book Reservation Feature

The user requested to implement a book reservation feature with the following requirements:

1.  When a user reserves a book, it should be tagged as "reserved".
2.  When a borrowed book is returned, the user who reserved it should see the book as "available", while other users still see it as "reserved".
3.  The "available" status for the reserver should only last until the reservation expires.

## Implementation Plan

To implement this feature, I followed these steps:

1.  **Analyzed the existing codebase:** I examined the database schema, backend routes, controllers, and models to understand the current implementation of the borrowing system.
2.  **Refactored the backend:** I created a new `Reservation` model, `reservationController`, and `reservations` route to separate the reservation logic from the borrowing logic.
3.  **Updated the frontend:** I modified the book detail page to reflect the new reservation status and provide users with the ability to reserve and cancel reservations.
4.  **Fixed a bug:** I identified and fixed a bug that was causing the server to crash upon startup.

## Backend Changes

### 1. `Reservation` Model

I created a new `server/models/Reservation.js` file to handle all database interactions related to reservations. This model includes methods for creating, finding, updating, and canceling reservations.

### 2. `reservationController`

I created a new `server/controllers/reservationController.js` file and moved all reservation-related logic from `borrowController.js` to this new controller. This includes methods for reserving a book, canceling a reservation, and expiring unclaimed reservations.

### 3. `reservations.js` Routes

I created a new `server/routes/reservations.js` file to define all reservation-related API endpoints. This includes routes for creating, getting, and canceling reservations.

### 4. Updated `borrowController.js`

I removed the reservation-related logic from `borrowController.js` and updated the `borrowBook` and `returnBook` methods to use the new `Reservation` model.

### 5. Updated `server.js`

I updated the main `server.js` file to use the new `reservations.js` route file.

## Frontend Changes

### 1. Book Detail Page

I updated the `client/app/student/book-view/[id].tsx` file to:

*   Use the new `/api/reservations` API endpoints.
*   Display the book status as "Available for you" if the user has reserved it and it's ready for pickup.
*   Show a "Borrow Reserved Book" button if the book is ready for the user to pick up.
*   Show a "Cancel Reservation" button if the user has a pending reservation.

## Bug Fix

I fixed a bug in `server/routes/reservations.js` that was causing the server to crash. The issue was that the `auth` middleware was being imported and used incorrectly. I corrected the import to specifically import the `authenticateToken` function and used it in the routes.

## Recent Bug Fixes and Enhancements

### 1. Borrow/Return Transactional Integrity

*   **Issue:** Encountered `TypeError: Borrow.updateStatus is not a function` during book returns and `ER_LOCK_WAIT_TIMEOUT` during reserved book borrowing.
*   **Fix:**
    *   Corrected `borrowController.js` to use the existing `Borrow.return` method.
    *   Refactored `Borrow.create` and `Borrow.return` methods in `server/models/Borrow.js` to accept and utilize a database `connection` object, ensuring all operations within a transaction use the same connection. This resolved database locking issues.
    *   Removed an unused `dueDate` variable in `borrowController.js`.

### 2. Frontend API Endpoint Correction and Refactoring

*   **Issue:** `Cannot GET /api/borrows/my-reservations` error due to incorrect API endpoint for reservations.
*   **Fix:**
    *   Created a new `reservationsAPI` object in `client/src/services/api.ts`.
    *   Moved `getMyReservations`, `reserveBook`, and `cancelReservation` from `borrowsAPI` to `reservationsAPI` and updated their endpoints to correctly point to `/api/reservations`.
    *   Updated `client/app/student/profile.tsx` to use the new `reservationsAPI`.

### 3. Missing Borrow History Function

*   **Issue:** `_srcServicesApi.borrowsAPI.getBorrowHistory is not a function` error after previous refactoring.
*   **Fix:** Re-added the `getBorrowHistory` function to the `borrowsAPI` object in `client/src/services/api.ts`.

### 4. Reserved Books Display Issues

*   **Issue:** Incorrect display of reserved books on the profile screen, including showing reservations for users with no active reservations and missing book title/author information.
*   **Fix:** Updated the `findReservationsByUserId` query in `server/models/Reservation.js` to:
    *   Include `b.author` and alias `b.title` to `title`.
    *   Filter reservations by status `pending` or `ready` to ensure only active reservations are displayed.

### 5. Fix 500 Error on Borrow Status Fetch

*   **Issue:** Encountered `AxiosError: Request failed with status code 500` when fetching borrow status, affecting user profile and book view. The `getMyBorrows` function in `server/controllers/borrowController.js` was attempting to use an undefined `borrows` variable.
*   **Fix:** Added `const borrows = await Borrow.findActiveByUserId(userId);` to `server/controllers/borrowController.js` to correctly fetch user's borrowed books.

## Overdue Books Feature

Implemented a comprehensive feature for handling overdue books with the following capabilities:

### 1. Fine Calculation

*   A fine of **5 pesos per day** is now automatically calculated for all overdue books.
*   The fine calculation now starts at **5 pesos on the first day** a book is overdue.
*   This calculation is performed in the backend (`borrowController.js` and `bookController.js`) whenever borrowed or all books are fetched, ensuring the fine amount is always up-to-date.

### 2. Borrowing Restrictions

*   Users with an active `has_overdue_books` flag are now **blocked from borrowing or reserving new books**.
*   The `has_overdue_books` flag is dynamically updated in `server/models/User.js` via the `updateOverdueStatus` method, which is called before borrowing or reserving actions in `borrowController.js` and `reservationController.js`.

### 3. Admin Panel Updates

*   **Overdue Indicator:** On the main book management screen, overdue books are now clearly marked with a prominent red **"OVERDUE"** badge and display the total fine on the book card.
*   **Return with Fine Note:** When an admin returns a book on behalf of a user, the confirmation alert now includes the total fine amount, ensuring the admin is aware of any outstanding charges.

### 4. User Profile Updates

*   Overdue books in a user's "Borrowed" list are now correctly marked as overdue and display the total calculated fine.
*   The currency symbol for fines has been updated from `$` to `₱` in the frontend (`client/app/student/profile.tsx`).

### 6. Overdue Borrower Restriction Fix

*   **Issue:** Users with overdue books were still able to borrow and reserve new books.
*   **Analysis:** The problem was a race condition. The logic updated the user's `has_overdue_books` flag in the database but then immediately fetched the user's profile. This sometimes retrieved stale data before the database update was fully committed.
*   **Fix:** The `borrowController.js` and `reservationController.js` were modified to use the direct boolean return value from the `User.updateOverdueStatus` function. This ensures the check is always performed against the most current data, reliably blocking restricted users.

## Search Functionality Implementation

*   **Goal:** Implement a search screen for students to search for books and display suggested tags based on user preferences.
*   **Backend Changes:**
    *   **Book Search Endpoint:** Added `GET /api/books/search` to `server/routes/books.js`. This endpoint takes a query parameter `q` and searches across `title`, `author`, `isbn`, and `synopsis` fields.
    *   **User Preferences Endpoint:** Added `GET /api/users/my-preferences` to `server/routes/users.js`. This endpoint fetches the current user's preferred subjects and genres.
    *   **Controller Methods:** Implemented `BookController.searchBooks` in `server/controllers/bookController.js` and `UserController.getMyPreferences` in `server/controllers/userController.js`.
    *   **Model Methods:** Implemented `Book.search` in `server/models/Book.js`.
    *   **API Service:** Updated `client/src/services/api.ts` to include `booksAPI.searchBooks` and `usersAPI.getMyPreferences`.
*   **Frontend Changes (`client/app/student/search.tsx`):**
    *   **UI:** Designed a new search screen with a search input, QR scanner icon, and a section for suggested tags.
    *   **State Management:** Implemented `useState` for `searchQuery`, `tags`, `searchResults`, `isLoading`, and `error`.
    *   **Data Fetching:** Used `useEffect` to fetch user preferences on component mount and `handleSearch` to perform book searches.
    *   **Tag Interaction:** Clicking a suggested tag populates the search box and triggers a search.
    *   **Results Display:** Implemented a `FlatList` to display search results using a local `BookItem` component.

### Clickable Search Results

*   **Issue:** Book items displayed in search results were not clickable, preventing users from viewing book details.
*   **Fix:** Modified `client/app/student/search.tsx`. The `BookItem` component was updated to wrap its content in a `TouchableOpacity` with an `onPress` handler. This handler uses `router.push` to navigate to the `student/book-view/[id]` screen, passing the book's ID. The `router` object is now passed as a prop to the `BookItem` component.

## Home Screen Search Bar Simplification

*   **Issue:** The search bar on the student home screen (`client/app/student/home.tsx`) accepted text input but did not properly pass the query to the search page, and also caused a `ReferenceError: Property 'filteredBooks' doesn't exist` after a previous modification.
*   **Analysis:** The original intent was to simplify the home screen search bar to act as a navigation button to the dedicated search screen. The `ReferenceError` was due to the removal of `searchQuery` state and the `handleSearch` function, which were part of the home screen's book filtering logic.
*   **Fix:**
    *   Modified `client/app/student/home.tsx` to remove the `TextInput` from the search bar. It now functions as a `TouchableOpacity` that navigates directly to `/student/search` when pressed.
    *   Removed `searchQuery` state and the `handleSearch` function from `home.tsx`.
    *   Re-introduced the `getFilteredBooks` function to correctly filter `allBooks` based solely on `selectedGenre`, resolving the `ReferenceError`.

## QR Functionality Implementation

*   **Goal:** Implement QR code generation for books and scanning capabilities within the application.
*   **Backend Changes:**
    *   **Database Schema:** Confirmed that the `books` table already contains a `qr_code` column, which stores a unique string identifier for each book. No new database tables or backend logic were required for QR code generation itself.
*   **Frontend Changes:**
    *   **QR Code Display (`client/app/student/book-view/[id].tsx`):**
        *   Installed `react-native-qrcode-svg` library.
        *   Modified `book-view/[id].tsx` to import `QrCodeSvg`.
        *   Constructed a full URL (e.g., `exp://<your-ip-address>/--/student/book-view/${book.id}`) to be encoded in the QR code.
        *   Rendered the `QrCodeSvg` component in the book details view.
    *   **QR Code Scanning (Student - `client/app/student/qr-scanner.tsx`):**
        *   Installed `expo-barcode-scanner` library.
        *   Implemented camera permission request logic.
        *   Integrated `BarCodeScanner` to display the camera feed.
        *   Developed `handleBarCodeScanned` to parse the scanned URL, extract the book ID, and navigate to `student/book-view/[id]`.
    *   **QR Code Scanning (Admin - `client/app/admin/qr-scanner.tsx`):**
        *   Implemented similar camera permission request and scanning logic as the student version.
        *   Navigates to `student/book-view/[id]` upon successful scan, as per current requirements.

### 7. Reservation Cancellation `ReferenceError` Fix

*   **Issue:** Encountered `ReferenceError: Borrow is not defined` when attempting to cancel a reservation.
*   **Fix:** Imported the `Borrow` model into `server/controllers/reservationController.js` to resolve the undefined reference.

### 8. Prevent Reserving Borrowed Books (Frontend Logic)

*   **Issue:** Users could reserve a book they currently had borrowed, leading to potential errors and incorrect UI states. The `userBorrow` state in the frontend was not updating correctly after a book was borrowed.
*   **Analysis:** The `checkUserBorrowStatus` function in `client/app/student/book-view/[id].tsx` was checking for borrow statuses of `'borrowed'` or `'overdue'`, while the backend was returning `'active'` for currently borrowed books. This mismatch prevented `userBorrow` from being correctly populated.
*   **Fix:** Modified `client/app/student/book-view/[id].tsx` to update the `checkUserBorrowStatus` function to correctly identify active borrows by checking for a status of `'active'`. This ensures the `userBorrow` state is accurate, allowing the UI to correctly display the "Renew" button and prevent reserving an already borrowed book.

## Expo Barcode Scanner Build Failure and WSL Permission Issues

*   **Initial Problem:** The `expo-barcode-scanner` build was failing, which was preventing the QR code scanning functionality from working.
*   **Attempted Fixes:**
    *   `sudo npx expo install --fix` was attempted, but it failed with an `EACCES` permission error.
    *   A clean reinstall of the `client` directory's `node_modules` and `package-lock.json` was performed.
    *   `npm install` was run again, but it also failed with an `EACCES` error.
    *   The npm cache was cleared using `npm cache clean --force`.
    *   `npm install --no-bin-links` was attempted, but it also failed with the same `EACCES` error.
*   **Root Cause Analysis:** The persistent `EACCES` errors strongly suggest a fundamental issue with file permissions within the WSL environment. The way the Windows filesystem is mounted in WSL is likely not handling Linux file permissions correctly, which causes `npm` to fail when it tries to perform file operations like renaming directories.
*   **Proposed Solution:** The recommended solution is to modify the `/etc/wsl.conf` file to enable metadata handling for the automount option. This will allow WSL to store and manage Linux permissions more effectively on the Windows filesystem. The user has been instructed to add the following to `/etc/wsl.conf` and then restart WSL:
    ```
    [automount]
    options = "metadata"
    ```
