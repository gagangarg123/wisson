import { cn } from '@/utils/cn';
import type { SeatStatus } from '@/types';

interface FloorMapProps {
  seats: SeatStatus[];
  onSeatClick: (seat: SeatStatus) => void;
}

export function FloorMap({ seats, onSeatClick }: FloorMapProps) {
  const getSeatColor = (seatStatus: SeatStatus): string => {
    const { seat, isAvailable, isOnLeave, bookedBy } = seatStatus;
    
    // If on leave - yellow
    if (isOnLeave) {
      return 'bg-yellow-400 hover:bg-yellow-500 border-yellow-500';
    }
    
    // If booked - red
    if (!isAvailable && bookedBy) {
      return 'bg-red-400 border-red-500 cursor-not-allowed';
    }
    
    // Available seats
    if (seat.type === 'FLOODER') {
      return 'bg-gray-300 hover:bg-gray-400 border-gray-400';
    }
    
    // Designated seats by batch
    if (seat.batch_owner === 1) {
      return 'bg-blue-400 hover:bg-blue-500 border-blue-500';
    }
    
    if (seat.batch_owner === 2) {
      return 'bg-emerald-400 hover:bg-emerald-500 border-emerald-500';
    }
    
    return 'bg-gray-200 border-gray-300';
  };

  const batch1Seats = seats.filter(s => s.seat.batch_owner === 1);
  const batch2Seats = seats.filter(s => s.seat.batch_owner === 2);
  const flooderSeats = seats.filter(s => s.seat.type === 'FLOODER');

  return (
    <div className="space-y-8">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-400 border border-blue-500" />
          <span className="text-sm text-gray-600">Batch 1</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-400 border border-emerald-500" />
          <span className="text-sm text-gray-600">Batch 2</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-300 border border-gray-400" />
          <span className="text-sm text-gray-600">Flooder (Public)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-400 border border-red-500" />
          <span className="text-sm text-gray-600">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-400 border border-yellow-500" />
          <span className="text-sm text-gray-600">Available (Leave)</span>
        </div>
      </div>

      {/* Floor Layout */}
      <div className="space-y-8">
        {/* Section A - Batch 1 */}
        <div className="p-4 bg-blue-50 rounded-xl">
          <h3 className="text-sm font-semibold text-blue-800 mb-3">Section A - Batch 1 Designated</h3>
          <div className="grid grid-cols-10 gap-2">
            {batch1Seats.map((seatStatus) => (
              <button
                key={seatStatus.seat.id}
                onClick={() => onSeatClick(seatStatus)}
                className={cn(
                  'aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-medium text-white shadow-sm transition-all hover:scale-105',
                  getSeatColor(seatStatus)
                )}
                title={seatStatus.bookedBy ? `Booked by ${seatStatus.bookedBy.name}` : `Seat ${seatStatus.seat.seat_number}`}
              >
                {seatStatus.seat.seat_number}
              </button>
            ))}
          </div>
        </div>

        {/* Section B - Batch 2 */}
        <div className="p-4 bg-emerald-50 rounded-xl">
          <h3 className="text-sm font-semibold text-emerald-800 mb-3">Section B - Batch 2 Designated</h3>
          <div className="grid grid-cols-10 gap-2">
            {batch2Seats.map((seatStatus) => (
              <button
                key={seatStatus.seat.id}
                onClick={() => onSeatClick(seatStatus)}
                className={cn(
                  'aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-medium text-white shadow-sm transition-all hover:scale-105',
                  getSeatColor(seatStatus)
                )}
                title={seatStatus.bookedBy ? `Booked by ${seatStatus.bookedBy.name}` : `Seat ${seatStatus.seat.seat_number}`}
              >
                {seatStatus.seat.seat_number}
              </button>
            ))}
          </div>
        </div>

        {/* Section C - Flooder */}
        <div className="p-4 bg-gray-100 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Section C - Flooder (Public Seats)</h3>
          <div className="grid grid-cols-10 gap-2">
            {flooderSeats.map((seatStatus) => (
              <button
                key={seatStatus.seat.id}
                onClick={() => onSeatClick(seatStatus)}
                className={cn(
                  'aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-medium text-white shadow-sm transition-all hover:scale-105',
                  getSeatColor(seatStatus)
                )}
                title={seatStatus.bookedBy ? `Booked by ${seatStatus.bookedBy.name}` : `Seat ${seatStatus.seat.seat_number}`}
              >
                {seatStatus.seat.seat_number}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
