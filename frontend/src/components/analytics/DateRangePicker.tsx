// components/DateRangePicker.tsx
import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (range: { startDate: Date | null; endDate: Date | null }) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleDayClick = (day: Date) => {
    if (!startDate || (startDate && endDate)) {
      // If no start date is selected or both dates are selected, set start date
      onChange({ startDate: day, endDate: null });
    } else {
      // If only start date is selected, set end date
      if (day < startDate) {
        onChange({ startDate: day, endDate: startDate });
      } else {
        onChange({ startDate, endDate: day });
      }
    }
  };
  
  const handleClear = () => {
    onChange({ startDate: null, endDate: null });
    setIsOpen(false);
  };
  
  const displayValue = startDate && endDate
    ? `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`
    : startDate
    ? `${format(startDate, 'MMM d, yyyy')} - Select end date`
    : 'Select date range';
  
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <div className="flex items-center">
          <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
          <span className={startDate ? 'text-gray-900' : 'text-gray-500'}>
            {displayValue}
          </span>
        </div>
        <div className="flex items-center">
          {(startDate || endDate) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="mr-2 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Clear</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-auto bg-white shadow-lg rounded-md border border-gray-200 p-4">
          <DayPicker
            mode="range"
            selected={{
              from: startDate || undefined,
              to: endDate || undefined
            }}
            onDayClick={handleDayClick}
            footer={
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
                >
                  Apply
                </button>
              </div>
            }
          />
        </div>
      )}
    </div>
  );
};
