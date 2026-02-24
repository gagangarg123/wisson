import { useState, useEffect } from 'react';
import { format, parseISO, isAfter, startOfDay } from 'date-fns';
import { Calendar, MapPin, Clock, Trash2, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import * as api from '@/services/api';
import type { Booking, Seat } from '@/types';

interface MyBookingsProps {
  userId: string;
  onMarkLeave: (bookingId: string, date: string) => Promise<void>;
  onCancelBooking: (bookingId: string) => Promise<void>;
}

export function MyBookings({ userId, onMarkLeave, onCancelBooking }: MyBookingsProps) {
  const [bookings, setBookings] = useState<(Booking & { seat: Seat })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, [userId]);

  const loadBookings = async () => {
    setIsLoading(true);
    const result = await api.getUserBookings(userId);
    if (result.success && result.data) {
      setBookings(result.data);
    }
    setIsLoading(false);
  };

  const upcomingBookings = bookings.filter(
    b => isAfter(parseISO(b.date), startOfDay(new Date())) || 
         format(parseISO(b.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );
  
  const pastBookings = bookings.filter(
    b => !isAfter(parseISO(b.date), startOfDay(new Date())) &&
         format(parseISO(b.date), 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd')
  );

  const handleMarkLeave = async (booking: Booking & { seat: Seat }) => {
    await onMarkLeave(booking.id, booking.date);
    loadBookings();
  };

  const handleCancel = async (booking: Booking & { seat: Seat }) => {
    await onCancelBooking(booking.id);
    loadBookings();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Upcoming Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming bookings</p>
              <p className="text-sm">Book a desk to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Seat {booking.seat.seat_number}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(parseISO(booking.date), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={booking.seat.batch_owner === 1 ? 'batch1' : booking.seat.batch_owner === 2 ? 'batch2' : 'default'}>
                          {booking.seat.type === 'FLOODER' ? 'Public' : `Batch ${booking.seat.batch_owner}`}
                        </Badge>
                        <Badge variant={booking.status === 'BOOKED' ? 'success' : 'warning'}>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {booking.status === 'BOOKED' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkLeave(booking)}
                        >
                          <Home className="w-4 h-4 mr-1" />
                          Mark Leave
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleCancel(booking)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Past Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pastBookings.slice(0, 10).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">
                        Seat {booking.seat.seat_number}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(parseISO(booking.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <Badge variant={booking.status === 'BOOKED' ? 'default' : 'warning'}>
                    {booking.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
