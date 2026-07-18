/** Firestore documents:
 * users: {uid, username, email, classId, currentCoins, contributionCoins, monthlyContributionCoins, monthlyContributionKey, createdAt}
 * skills: {userId, sellerName, classId, title, subject, category, description, price, duration, availableDate, startTime, createdAt, isActive}
 * bookings: {buyerId, buyerName, sellerId, sellerName, skillId, skillTitle, subject, classId, price, duration, availableDate, startTime, bookingTime, status, completedAt}
 * histories: {userId, classId, type, amount, description, bookingId, createdAt}
 * notifications: {userId, classId, title, message, type, read, createdAt}
 * classes: {className, members, createdAt}
 */
export const BOOKING_STATUS = { RESERVED: 'reserved', COMPLETED: 'completed', CANCELLED: 'cancelled' };
