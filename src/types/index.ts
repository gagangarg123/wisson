// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  batch: 1 | 2;
  role: 'admin' | 'user';
}

// Seat Types
export type SeatType = 'DESIGNATED' | 'FLOODER';
export type BatchOwner = 1 | 2 | 'ALL';

export interface Seat {
  id: string;
  seat_number: number;
  type: SeatType;
  batch_owner: BatchOwner;
}

// Booking Types
export type BookingStatus = 'BOOKED' | 'CANCELLED' | 'ON_LEAVE';

export interface Booking {
  id: string;
  user_id: string;
  seat_id: string;
  date: string; // ISO date string YYYY-MM-DD
  status: BookingStatus;
}

// Holiday Types
export interface Holiday {
  id: string;
  date: string;
  name: string;
}

// System Config
export interface SystemConfig {
  id: string;
  anchor_date: string;
}

// Week Type
export type WeekType = 'WEEK_1' | 'WEEK_2';

// Seat Status for UI
export interface SeatStatus {
  seat: Seat;
  isAvailable: boolean;
  bookedBy?: User;
  isOnLeave: boolean;
  isDesignatedDay: boolean;
  canBook: boolean;
  bookingBlockedReason?: string;
}

// Auth Context
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
