import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getWeekDates, determineWeekType, getDesignatedBatchForDay } from '@/utils/dateUtils';
import { cn } from '@/utils/cn';
import { addWeeks, subWeeks, format, isSameDay, isToday } from 'date-fns';
import type { Holiday } from '@/types';

interface WeekSelectorProps {
  currentWeekStart: Date;
  selectedDate: Date;
  onWeekChange: (date: Date) => void;
  onDateSelect: (date: Date) => void;
  userBatch: 1 | 2;
  holidays: Holiday[];
}

export function WeekSelector({ 
  currentWeekStart, 
  selectedDate, 
  onWeekChange, 
  onDateSelect,
  userBatch,
  holidays
}: WeekSelectorProps) {
  const weekDates = getWeekDates(currentWeekStart);
  const weekType = determineWeekType(currentWeekStart);

  const isHoliday = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return holidays.some(h => h.date === dateStr);
  };

  const getHolidayName = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const holiday = holidays.find(h => h.date === dateStr);
    return holiday?.name;
  };

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onWeekChange(subWeeks(currentWeekStart, 1))}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className="font-semibold text-gray-900">
            {format(weekDates[0], 'MMM d')} - {format(weekDates[4], 'MMM d, yyyy')}
          </span>
          <Badge variant={weekType === 'WEEK_1' ? 'info' : 'success'}>
            {weekType === 'WEEK_1' ? 'Week 1' : 'Week 2'}
          </Badge>
        </div>

        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onWeekChange(addWeeks(currentWeekStart, 1))}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Week Schedule Info */}
      <div className="flex justify-center gap-4 text-sm">
        <span className={cn(
          'px-3 py-1 rounded-full',
          weekType === 'WEEK_1' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
        )}>
          Mon-Wed: Batch {weekType === 'WEEK_1' ? '1' : '2'}
        </span>
        <span className={cn(
          'px-3 py-1 rounded-full',
          weekType === 'WEEK_1' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
        )}>
          Thu-Fri: Batch {weekType === 'WEEK_1' ? '2' : '1'}
        </span>
      </div>

      {/* Day Selector */}
      <div className="grid grid-cols-5 gap-2">
        {weekDates.map((date) => {
          const designatedBatch = getDesignatedBatchForDay(date);
          const isUserDay = designatedBatch === userBatch;
          const holiday = isHoliday(date);
          const holidayName = getHolidayName(date);
          
          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateSelect(date)}
              disabled={holiday}
              className={cn(
                'p-3 rounded-xl text-center transition-all border-2',
                isSameDay(date, selectedDate) 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-transparent hover:bg-gray-50',
                holiday && 'opacity-50 cursor-not-allowed bg-red-50',
                isUserDay && !holiday && 'ring-2 ring-green-200'
              )}
            >
              <p className="text-xs text-gray-500 uppercase">
                {format(date, 'EEE')}
              </p>
              <p className={cn(
                'text-lg font-semibold',
                isToday(date) ? 'text-blue-600' : 'text-gray-900'
              )}>
                {format(date, 'd')}
              </p>
              {holiday ? (
                <p className="text-xs text-red-500 truncate" title={holidayName}>
                  {holidayName}
                </p>
              ) : (
                <p className={cn(
                  'text-xs',
                  isUserDay ? 'text-green-600 font-medium' : 'text-gray-400'
                )}>
                  {isUserDay ? 'Your Day' : `B${designatedBatch}`}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
