import { differenceInDays, format, parseISO, startOfDay, setHours, setMinutes, isAfter, subDays, getDay } from 'date-fns';
import type { WeekType } from '../types';

// Anchor date for week rotation calculation (can be configured)
const DEFAULT_ANCHOR_DATE = '2024-01-01';

export function getAnchorDate(configAnchorDate?: string): Date {
  return parseISO(configAnchorDate || DEFAULT_ANCHOR_DATE);
}

export function determineWeekType(date: Date, anchorDate?: string): WeekType {
  const anchor = getAnchorDate(anchorDate);
  const targetDate = startOfDay(date);
  const anchorStart = startOfDay(anchor);
  
  const daysDiff = differenceInDays(targetDate, anchorStart);
  const weekNumber = Math.floor(daysDiff / 7);
  
  return weekNumber % 2 === 0 ? 'WEEK_1' : 'WEEK_2';
}

export function getDayOfWeek(date: Date): number {
  return getDay(date); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
}

export function isUserDesignatedDay(userBatch: 1 | 2, date: Date, anchorDate?: string): boolean {
  const weekType = determineWeekType(date, anchorDate);
  const dayOfWeek = getDayOfWeek(date);
  
  // Weekend - no one is designated
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;
  
  // Week 1: Batch 1 → Mon Tue Wed, Batch 2 → Thu Fri
  // Week 2: Batch 2 → Mon Tue Wed, Batch 1 → Thu Fri
  
  const isMonTueWed = dayOfWeek >= 1 && dayOfWeek <= 3;
  const isThuFri = dayOfWeek >= 4 && dayOfWeek <= 5;
  
  if (weekType === 'WEEK_1') {
    if (userBatch === 1) return isMonTueWed;
    if (userBatch === 2) return isThuFri;
  } else {
    // WEEK_2
    if (userBatch === 2) return isMonTueWed;
    if (userBatch === 1) return isThuFri;
  }
  
  return false;
}

export function getDesignatedBatchForDay(date: Date, anchorDate?: string): 1 | 2 | null {
  const weekType = determineWeekType(date, anchorDate);
  const dayOfWeek = getDayOfWeek(date);
  
  // Weekend
  if (dayOfWeek === 0 || dayOfWeek === 6) return null;
  
  const isMonTueWed = dayOfWeek >= 1 && dayOfWeek <= 3;
  
  if (weekType === 'WEEK_1') {
    return isMonTueWed ? 1 : 2;
  } else {
    return isMonTueWed ? 2 : 1;
  }
}

export function check3PMRule(bookingDate: Date, currentTime: Date): { allowed: boolean; reason?: string } {
  const bookingDateStart = startOfDay(bookingDate);
  const previousDay = subDays(bookingDateStart, 1);
  const thresholdTime = setMinutes(setHours(previousDay, 15), 0); // 3 PM previous day
  
  if (isAfter(currentTime, thresholdTime) || currentTime.getTime() === thresholdTime.getTime()) {
    return { allowed: true };
  }
  
  return {
    allowed: false,
    reason: `Booking opens at 3 PM on ${format(previousDay, 'EEEE, MMM d')}`
  };
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd');
}

export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEEE, MMMM d, yyyy');
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d');
}

export function getWeekDates(startDate: Date): Date[] {
  const dates: Date[] = [];
  const dayOfWeek = getDay(startDate);
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(startDate);
  monday.setDate(startDate.getDate() + mondayOffset);
  
  for (let i = 0; i < 5; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}

export function isWeekend(date: Date): boolean {
  const day = getDay(date);
  return day === 0 || day === 6;
}
