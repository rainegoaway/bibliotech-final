const cron = require('node-cron');
const Notification = require('../models/Notification');
const Borrow = require('../models/Borrow');
const User = require('../models/User');
const Book = require('../models/Book');

const startNotificationScheduler = () => {
  // Schedule to run once every day at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Running daily notification check...');
    try {
      // 1. Due date reminders (1 day left)
      const soonDueBorrows = await Borrow.findSoonDue();
      for (const borrow of soonDueBorrows) {
        await Notification.create({
          userId: borrow.user_id,
          type: 'renewal',
          title: 'Book Due Soon!',
          message: `Your borrowed book '${borrow.book_title}' is due tomorrow. Please renew or return it.`, // Assuming book_title is joined
          relatedBookId: borrow.book_id,
          relatedBorrowId: borrow.id,
        });
      }

      // 2. Overdue books and fines
      const overdueBorrows = await Borrow.findOverdue();
      for (const borrow of overdueBorrows) {
        const fineAmount = await Borrow.calculateFine(borrow.id);
        await Notification.create({
          userId: borrow.user_id,
          type: 'overdue',
          title: 'Book Overdue!',
          message: `Your borrowed book '${borrow.book_title}' is overdue. A fine of ₱${fineAmount.toFixed(2)} has been incurred.`, // Assuming book_title is joined
          relatedBookId: borrow.book_id,
          relatedBorrowId: borrow.id,
        });
        // Update user's has_overdue_books status
        await User.updateOverdueStatus(borrow.user_id);
      }

      console.log('Daily notification check completed.');
    } catch (error) {
      console.error('Error during daily notification check:', error);
    }
  });
};

module.exports = startNotificationScheduler;
