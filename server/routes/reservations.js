const express = require('express');
const router = express.Router();
const ReservationController = require('../controllers/reservationController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// ============================================
// RESERVATION ROUTES
// ============================================

// Reserve a book
router.post('/', ReservationController.reserveBook);

// Get current user's reservations
router.get('/my-reservations', ReservationController.getMyReservations);

// Cancel a reservation
router.delete('/:reservationId', ReservationController.cancelReservation);

// Expire unclaimed reservations (for cron job)
router.post('/expire', isAdmin, ReservationController.expireUnclaimedReservations);

module.exports = router;
