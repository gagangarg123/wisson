import type { User, Seat, Booking, Holiday, SystemConfig } from '../types';

// Generate UUID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Simple password hashing (in production use bcrypt)
export function hashPassword(password: string): string {
  return btoa(password + '_hashed');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Initialize seats: 40 DESIGNATED (20 each batch), 10 FLOODER
function initializeSeats(): Seat[] {
  const seats: Seat[] = [];
  
  // Batch 1 designated seats (1-20)
  for (let i = 1; i <= 20; i++) {
    seats.push({
      id: `seat-${i}`,
      seat_number: i,
      type: 'DESIGNATED',
      batch_owner: 1
    });
  }
  
  // Batch 2 designated seats (21-40)
  for (let i = 21; i <= 40; i++) {
    seats.push({
      id: `seat-${i}`,
      seat_number: i,
      type: 'DESIGNATED',
      batch_owner: 2
    });
  }
  
  // Flooder seats (41-50)
  for (let i = 41; i <= 50; i++) {
    seats.push({
      id: `seat-${i}`,
      seat_number: i,
      type: 'FLOODER',
      batch_owner: 'ALL'
    });
  }
  
  return seats;
}

// Mock Database Storage
class MockDatabase {
  private users: User[] = [];
  private seats: Seat[] = [];
  private bookings: Booking[] = [];
  private holidays: Holiday[] = [];
  private config: SystemConfig;
  
  constructor() {
    this.seats = initializeSeats();
    this.config = {
      id: 'config-1',
      anchor_date: '2024-01-01'
    };
    
    // Add some sample users
    this.users = [
      {
        id: 'user-1',
        name: 'Admin User',
        email: 'admin@company.com',
        password_hash: hashPassword('admin123'),
        batch: 1,
        role: 'admin'
      },
      {
        id: 'user-2',
        name: 'John Doe',
        email: 'john@company.com',
        password_hash: hashPassword('password'),
        batch: 1,
        role: 'user'
      },
      {
        id: 'user-3',
        name: 'Jane Smith',
        email: 'jane@company.com',
        password_hash: hashPassword('password'),
        batch: 2,
        role: 'user'
      }
    ];
    
    // Load from localStorage if available
    this.loadFromStorage();
  }
  
  private saveToStorage() {
    localStorage.setItem('db_users', JSON.stringify(this.users));
    localStorage.setItem('db_bookings', JSON.stringify(this.bookings));
    localStorage.setItem('db_holidays', JSON.stringify(this.holidays));
  }
  
  private loadFromStorage() {
    const users = localStorage.getItem('db_users');
    const bookings = localStorage.getItem('db_bookings');
    const holidays = localStorage.getItem('db_holidays');
    
    if (users) this.users = JSON.parse(users);
    if (bookings) this.bookings = JSON.parse(bookings);
    if (holidays) this.holidays = JSON.parse(holidays);
  }
  
  // User operations
  findUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email === email);
  }
  
  findUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }
  
  createUser(data: Omit<User, 'id'>): User {
    const user: User = {
      id: generateId(),
      ...data
    };
    this.users.push(user);
    this.saveToStorage();
    return user;
  }
  
  getAllUsers(): User[] {
    return this.users;
  }
  
  // Seat operations
  getAllSeats(): Seat[] {
    return this.seats;
  }
  
  findSeatById(id: string): Seat | undefined {
    return this.seats.find(s => s.id === id);
  }
  
  // Booking operations
  findBookingBySeatAndDate(seatId: string, date: string): Booking | undefined {
    return this.bookings.find(b => b.seat_id === seatId && b.date === date && b.status !== 'CANCELLED');
  }
  
  findBookingsByDate(date: string): Booking[] {
    return this.bookings.filter(b => b.date === date && b.status !== 'CANCELLED');
  }
  
  findBookingsByUser(userId: string): Booking[] {
    return this.bookings.filter(b => b.user_id === userId);
  }
  
  findUserBookingForDate(userId: string, date: string): Booking | undefined {
    return this.bookings.find(b => b.user_id === userId && b.date === date && b.status !== 'CANCELLED');
  }
  
  createBooking(data: Omit<Booking, 'id'>): Booking {
    const booking: Booking = {
      id: generateId(),
      ...data
    };
    this.bookings.push(booking);
    this.saveToStorage();
    return booking;
  }
  
  updateBooking(id: string, updates: Partial<Booking>): Booking | undefined {
    const index = this.bookings.findIndex(b => b.id === id);
    if (index === -1) return undefined;
    
    this.bookings[index] = { ...this.bookings[index], ...updates };
    this.saveToStorage();
    return this.bookings[index];
  }
  
  // Holiday operations
  getAllHolidays(): Holiday[] {
    return this.holidays;
  }
  
  findHolidayByDate(date: string): Holiday | undefined {
    return this.holidays.find(h => h.date === date);
  }
  
  createHoliday(data: Omit<Holiday, 'id'>): Holiday {
    const holiday: Holiday = {
      id: generateId(),
      ...data
    };
    this.holidays.push(holiday);
    this.saveToStorage();
    return holiday;
  }
  
  deleteHoliday(id: string): boolean {
    const index = this.holidays.findIndex(h => h.id === id);
    if (index === -1) return false;
    
    this.holidays.splice(index, 1);
    this.saveToStorage();
    return true;
  }
  
  // Config operations
  getConfig(): SystemConfig {
    return this.config;
  }
  
  // Analytics
  getOccupancyForDateRange(startDate: string, endDate: string): { date: string; occupancy: number }[] {
    const results: { date: string; occupancy: number }[] = [];
    const totalSeats = this.seats.length;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const bookings = this.findBookingsByDate(dateStr);
      const bookedCount = bookings.filter(b => b.status === 'BOOKED').length;
      results.push({
        date: dateStr,
        occupancy: Math.round((bookedCount / totalSeats) * 100)
      });
    }
    
    return results;
  }
}

export const db = new MockDatabase();
