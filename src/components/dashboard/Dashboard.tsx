import { useState, useEffect, useCallback } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { LogOut, User, Shield, BarChart2, Calendar as CalendarIcon, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FloorMap } from '@/components/booking/FloorMap';
import { WeekSelector } from '@/components/booking/WeekSelector';
import { SeatModal } from '@/components/booking/SeatModal';
import { MyBookings } from '@/components/dashboard/MyBookings';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { useAuthStore } from '@/store/authStore';
import * as api from '@/services/api';
import type { SeatStatus, Holiday } from '@/types';
import { determineWeekType } from '@/utils/dateUtils';
import toast, { Toaster } from 'react-hot-toast';

type TabType = 'booking' | 'mybookings' | 'admin';

export function Dashboard() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('booking');
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    return startOfWeek(today, { weekStartsOn: 1 });
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    // If weekend, select next Monday
    if (day === 0) return addDays(today, 1);
    if (day === 6) return addDays(today, 2);
    return today;
  });
  const [seats, setSeats] = useState<SeatStatus[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<SeatStatus | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [occupancy, setOccupancy] = useState(0);

  const loadSeats = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const result = await api.getSeatsForDate(dateStr, user.id);
    if (result.success && result.data) {
      setSeats(result.data);
      // Calculate occupancy
      const booked = result.data.filter(s => !s.isAvailable).length;
      setOccupancy(Math.round((booked / result.data.length) * 100));
    }
    setIsLoading(false);
  }, [selectedDate, user]);

  const loadHolidays = useCallback(async () => {
    const result = await api.getHolidays();
    if (result.success && result.data) {
      setHolidays(result.data);
    }
  }, []);

  useEffect(() => {
    loadSeats();
    loadHolidays();
  }, [loadSeats, loadHolidays]);

  const handleSeatClick = (seatStatus: SeatStatus) => {
    setSelectedSeat(seatStatus);
    setIsModalOpen(true);
  };

  const handleBook = async (seatId: string) => {
    if (!user) return;
    setIsBooking(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const result = await api.bookSeat(user.id, seatId, dateStr);
    
    if (result.success) {
      toast.success('Seat booked successfully!');
      loadSeats();
    } else {
      toast.error(result.error || 'Booking failed');
    }
    setIsBooking(false);
  };

  const handleMarkLeave = async (_bookingId: string, date: string) => {
    if (!user) return;
    const result = await api.markLeave(user.id, date);
    if (result.success) {
      toast.success('Leave marked - seat released');
      loadSeats();
    } else {
      toast.error(result.error || 'Failed to mark leave');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!user) return;
    const result = await api.cancelBooking(user.id, bookingId);
    if (result.success) {
      toast.success('Booking cancelled');
      loadSeats();
    } else {
      toast.error(result.error || 'Failed to cancel booking');
    }
  };

  const weekType = determineWeekType(selectedDate);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">DeskBook</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">
                    Batch {user.batch} • {user.role === 'admin' ? 'Admin' : 'User'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'booking' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('booking')}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Book a Desk
          </Button>
          <Button
            variant={activeTab === 'mybookings' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('mybookings')}
          >
            <Briefcase className="w-4 h-4 mr-2" />
            My Bookings
          </Button>
          {user.role === 'admin' && (
            <Button
              variant={activeTab === 'admin' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('admin')}
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin
            </Button>
          )}
        </div>

        {activeTab === 'booking' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Current Week</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {weekType === 'WEEK_1' ? 'Week 1' : 'Week 2'}
                      </p>
                    </div>
                    <CalendarIcon className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Your Batch</p>
                      <p className="text-2xl font-bold text-gray-900">Batch {user.batch}</p>
                    </div>
                    <Badge variant={user.batch === 1 ? 'batch1' : 'batch2'} className="text-lg px-3 py-1">
                      B{user.batch}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Occupancy</p>
                      <p className="text-2xl font-bold text-gray-900">{occupancy}%</p>
                    </div>
                    <BarChart2 className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Week Selector */}
            <Card>
              <CardContent className="p-6">
                <WeekSelector
                  currentWeekStart={currentWeekStart}
                  selectedDate={selectedDate}
                  onWeekChange={setCurrentWeekStart}
                  onDateSelect={(date) => {
                    setSelectedDate(date);
                    setCurrentWeekStart(startOfWeek(date, { weekStartsOn: 1 }));
                  }}
                  userBatch={user.batch}
                  holidays={holidays}
                />
              </CardContent>
            </Card>

            {/* Floor Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Floor Map - {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  </div>
                ) : (
                  <FloorMap
                    seats={seats}
                    onSeatClick={handleSeatClick}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'mybookings' && (
          <MyBookings
            userId={user.id}
            onMarkLeave={handleMarkLeave}
            onCancelBooking={handleCancelBooking}
          />
        )}

        {activeTab === 'admin' && user.role === 'admin' && (
          <AdminPanel onHolidayChange={loadHolidays} />
        )}
      </main>

      {/* Seat Modal */}
      <SeatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        seatStatus={selectedSeat}
        selectedDate={selectedDate}
        onBook={handleBook}
        isBooking={isBooking}
      />
    </div>
  );
}
