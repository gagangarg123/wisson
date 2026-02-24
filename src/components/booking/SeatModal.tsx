import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Clock, User, AlertCircle, CheckCircle } from 'lucide-react';
import type { SeatStatus } from '@/types';
import { formatDisplayDate } from '@/utils/dateUtils';

interface SeatModalProps {
  isOpen: boolean;
  onClose: () => void;
  seatStatus: SeatStatus | null;
  selectedDate: Date;
  onBook: (seatId: string) => Promise<void>;
  isBooking: boolean;
}

export function SeatModal({ 
  isOpen, 
  onClose, 
  seatStatus, 
  selectedDate,
  onBook,
  isBooking
}: SeatModalProps) {
  if (!seatStatus) return null;

  const { seat, bookedBy, isOnLeave, canBook, bookingBlockedReason, isDesignatedDay } = seatStatus;

  const handleBook = async () => {
    await onBook(seat.id);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Seat ${seat.seat_number}`} size="md">
      <div className="space-y-6">
        {/* Seat Info */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Seat Type</p>
            <p className="font-medium">
              {seat.type === 'DESIGNATED' 
                ? `Designated - Batch ${seat.batch_owner}` 
                : 'Flooder (Public)'}
            </p>
          </div>
          <Badge variant={seat.batch_owner === 1 ? 'batch1' : seat.batch_owner === 2 ? 'batch2' : 'default'}>
            {seat.type === 'FLOODER' ? 'Public' : `Batch ${seat.batch_owner}`}
          </Badge>
        </div>

        {/* Date */}
        <div className="flex items-center gap-3 text-gray-600">
          <Clock className="w-5 h-5" />
          <span>{formatDisplayDate(selectedDate)}</span>
        </div>

        {/* Status */}
        {bookedBy && !isOnLeave && (
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <User className="w-5 h-5 text-red-500" />
            <div>
              <p className="font-medium text-red-700">Booked by {bookedBy.name}</p>
              <p className="text-sm text-red-500">{bookedBy.email}</p>
            </div>
          </div>
        )}

        {isOnLeave && (
          <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-700">Available - Original owner on leave</p>
              <p className="text-sm text-yellow-600">This seat has been released</p>
            </div>
          </div>
        )}

        {isDesignatedDay && !bookedBy && (
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-700">Your Designated Day!</p>
              <p className="text-sm text-green-600">This is your batch's scheduled day</p>
            </div>
          </div>
        )}

        {/* Booking Blocked Reason */}
        {bookingBlockedReason && !canBook && (
          <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <Clock className="w-5 h-5 text-orange-500" />
            <p className="text-sm text-orange-700">{bookingBlockedReason}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleBook} 
            className="flex-1"
            disabled={!canBook}
            isLoading={isBooking}
          >
            {canBook ? 'Confirm Booking' : 'Not Available'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
