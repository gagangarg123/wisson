import type { User, Seat, Booking, Holiday, SeatStatus, ApiResponse } from '../types';
import { db, hashPassword, verifyPassword } from './mockDatabase';
import { 
  isUserDesignatedDay, 
  check3PMRule, 
  getDesignatedBatchForDay,
  isWeekend 
} from '../utils/dateUtils';
import { parseISO } from 'date-fns';

// JWT Mock (in production use proper JWT library)
function generateToken(userId: string): string {
  return btoa(JSON.stringify({ userId, exp: Date.now() + 24 * 60 * 60 * 1000 }));
}

function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = JSON.parse(atob(token));
    if (decoded.exp < Date.now()) return null;
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

// Auth API
export async function register(name: string, email: string, password: string, batch: 1 | 2): Promise<ApiResponse<{ user: User; token: string }>> {
  // Simulate API delay
  await new Promise(r => setTimeout(r, 300));
  
  const existingUser = db.findUserByEmail(email);
  if (existingUser) {
    return { success: false, error: 'Email already registered' };
  }
  
  const user = db.createUser({
    name,
    email,
    password_hash: hashPassword(password),
    batch,
    role: 'user'
  });
  
  const token = generateToken(user.id);
  return { success: true, data: { user, token } };
}

export async function login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
  await new Promise(r => setTimeout(r, 300));
  
  const user = db.findUserByEmail(email);
  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }
  
  if (!verifyPassword(password, user.password_hash)) {
    return { success: false, error: 'Invalid email or password' };
  }
  
  const token = generateToken(user.id);
  return { success: true, data: { user, token } };
}

export function getCurrentUser(token: string): User | null {
  const decoded = verifyToken(token);
  if (!decoded) return null;
  return db.findUserById(decoded.userId) || null;
}

// Seat API
export async function getSeatsForDate(date: string, currentUserId?: string): Promise<ApiResponse<SeatStatus[]>> {
  await new Promise(r => setTimeout(r, 200));
  
  const seats = db.getAllSeats();
  const bookings = db.findBookingsByDate(date);
  const holiday = db.findHolidayByDate(date);
  const config = db.getConfig();
  const dateObj = parseISO(date);
  const currentUser = currentUserId ? db.findUserById(currentUserId) : null;
  
  const seatStatuses: SeatStatus[] = seats.map(seat => {
    const booking = bookings.find(b => b.seat_id === seat.id);
    const bookedUser = booking ? db.findUserById(booking.user_id) : undefined;
    const isOnLeave = booking?.status === 'ON_LEAVE';
    
    let isDesignatedDay = false;
    if (currentUser && seat.type === 'DESIGNATED') {
      isDesignatedDay = seat.batch_owner === currentUser.batch && 
                        isUserDesignatedDay(currentUser.batch, dateObj, config.anchor_date);
    }
    
    let canBook = false;
    let bookingBlockedReason: string | undefined;
    
    if (holiday) {
      bookingBlockedReason = `Holiday: ${holiday.name}`;
    } else if (isWeekend(dateObj)) {
      bookingBlockedReason = 'Weekend - Office Closed';
    } else if (booking && booking.status === 'BOOKED') {
      bookingBlockedReason = `Booked by ${bookedUser?.name || 'Unknown'}`;
    } else if (currentUser) {
      // Check if user already has a booking for this date
      const userExistingBooking = db.findUserBookingForDate(currentUser.id, date);
      if (userExistingBooking) {
        bookingBlockedReason = 'You already have a booking for this date';
      } else if (seat.type === 'FLOODER') {
        canBook = true;
      } else if (seat.type === 'DESIGNATED') {
        if (isDesignatedDay) {
          canBook = true;
        } else if (isOnLeave) {
          // Seat is available due to leave - check 3PM rule
          const check = check3PMRule(dateObj, new Date());
          if (check.allowed) {
            canBook = true;
          } else {
            bookingBlockedReason = check.reason;
          }
        } else if (!booking) {
          // Empty designated seat - check if it's the designated batch's day
          const designatedBatch = getDesignatedBatchForDay(dateObj, config.anchor_date);
          if (designatedBatch === seat.batch_owner) {
            // It's the owner batch's day - they should book it
            if (currentUser.batch !== seat.batch_owner) {
              // Non-owner trying to book on owner's day
              const check = check3PMRule(dateObj, new Date());
              if (check.allowed) {
                canBook = true;
              } else {
                bookingBlockedReason = check.reason;
              }
            } else {
              canBook = true; // Owner can book
            }
          } else {
            // Not the owner batch's day - 3PM rule applies
            const check = check3PMRule(dateObj, new Date());
            if (check.allowed) {
              canBook = true;
            } else {
              bookingBlockedReason = check.reason;
            }
          }
        }
      }
    } else {
      bookingBlockedReason = 'Please login to book';
    }
    
    return {
      seat,
      isAvailable: !booking || booking.status === 'ON_LEAVE',
      bookedBy: bookedUser,
      isOnLeave,
      isDesignatedDay,
      canBook,
      bookingBlockedReason
    };
  });
  
  return { success: true, data: seatStatuses };
}

// Booking API
export async function bookSeat(
  userId: string, 
  seatId: string, 
  date: string
): Promise<ApiResponse<Booking>> {
  await new Promise(r => setTimeout(r, 300));
  
  const user = db.findUserById(userId);
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  
  const seat = db.findSeatById(seatId);
  if (!seat) {
    return { success: false, error: 'Seat not found' };
  }
  
  const dateObj = parseISO(date);
  const config = db.getConfig();
  
  // Check holiday
  const holiday = db.findHolidayByDate(date);
  if (holiday) {
    return { success: false, error: `Cannot book on holiday: ${holiday.name}` };
  }
  
  // Check weekend
  if (isWeekend(dateObj)) {
    return { success: false, error: 'Cannot book on weekends' };
  }
  
  // Check if seat already booked
  const existingBooking = db.findBookingBySeatAndDate(seatId, date);
  if (existingBooking && existingBooking.status === 'BOOKED') {
    return { success: false, error: 'Seat is already booked' };
  }
  
  // Check if user already has a booking
  const userExistingBooking = db.findUserBookingForDate(userId, date);
  if (userExistingBooking) {
    return { success: false, error: 'You already have a booking for this date' };
  }
  
  // Check seat type and apply rules
  if (seat.type === 'DESIGNATED') {
    const isDesignated = isUserDesignatedDay(user.batch, dateObj, config.anchor_date);
    const isOwnSeat = seat.batch_owner === user.batch;
    
    if (!isDesignated || !isOwnSeat) {
      // 3 PM RULE - ENFORCED SERVER-SIDE
      const check = check3PMRule(dateObj, new Date());
      if (!check.allowed) {
        return { success: false, error: check.reason || 'Booking not allowed yet (3 PM rule)' };
      }
    }
  }
  
  // If there was an ON_LEAVE booking, cancel it
  if (existingBooking && existingBooking.status === 'ON_LEAVE') {
    db.updateBooking(existingBooking.id, { status: 'CANCELLED' });
  }
  
  const booking = db.createBooking({
    user_id: userId,
    seat_id: seatId,
    date,
    status: 'BOOKED'
  });
  
  return { success: true, data: booking };
}

export async function markLeave(userId: string, date: string): Promise<ApiResponse<Booking>> {
  await new Promise(r => setTimeout(r, 300));
  
  const user = db.findUserById(userId);
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  
  // Find user's booking for the date
  const booking = db.findUserBookingForDate(userId, date);
  if (!booking) {
    return { success: false, error: 'No booking found for this date' };
  }
  
  // Update booking status to ON_LEAVE
  const updatedBooking = db.updateBooking(booking.id, { status: 'ON_LEAVE' });
  
  return { success: true, data: updatedBooking };
}

export async function cancelBooking(userId: string, bookingId: string): Promise<ApiResponse<void>> {
  await new Promise(r => setTimeout(r, 300));
  
  const booking = db.findBookingsByUser(userId).find(b => b.id === bookingId);
  if (!booking) {
    return { success: false, error: 'Booking not found' };
  }
  
  db.updateBooking(bookingId, { status: 'CANCELLED' });
  return { success: true };
}

export async function getUserBookings(userId: string): Promise<ApiResponse<(Booking & { seat: Seat })[]>> {
  await new Promise(r => setTimeout(r, 200));
  
  const bookings = db.findBookingsByUser(userId);
  const bookingsWithSeats = bookings
    .filter(b => b.status !== 'CANCELLED')
    .map(b => ({
      ...b,
      seat: db.findSeatById(b.seat_id)!
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return { success: true, data: bookingsWithSeats };
}

// Holiday API
export async function getHolidays(): Promise<ApiResponse<Holiday[]>> {
  await new Promise(r => setTimeout(r, 200));
  return { success: true, data: db.getAllHolidays() };
}

export async function addHoliday(date: string, name: string): Promise<ApiResponse<Holiday>> {
  await new Promise(r => setTimeout(r, 300));
  
  const existing = db.findHolidayByDate(date);
  if (existing) {
    return { success: false, error: 'Holiday already exists for this date' };
  }
  
  const holiday = db.createHoliday({ date, name });
  return { success: true, data: holiday };
}

export async function deleteHoliday(id: string): Promise<ApiResponse<void>> {
  await new Promise(r => setTimeout(r, 300));
  
  const success = db.deleteHoliday(id);
  if (!success) {
    return { success: false, error: 'Holiday not found' };
  }
  
  return { success: true };
}

// Analytics API
export async function getOccupancy(startDate: string, endDate: string): Promise<ApiResponse<{ date: string; occupancy: number }[]>> {
  await new Promise(r => setTimeout(r, 200));
  
  const data = db.getOccupancyForDateRange(startDate, endDate);
  return { success: true, data };
}

export async function getAllUsers(): Promise<ApiResponse<User[]>> {
  await new Promise(r => setTimeout(r, 200));
  return { success: true, data: db.getAllUsers() };
}
