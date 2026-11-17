import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface SingleDatePickerProps {
  value?: string;
  onChange: (dateStr: string) => void;
  isOpen: boolean;
  onClose: () => void;
  align?: 'left' | 'right' | 'auto';
}

export const SingleDatePicker: React.FC<SingleDatePickerProps> = ({
  value = '',
  onChange,
  isOpen,
  onClose,
  align = 'auto',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial viewDate from value if available
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });

  const [computedAlign, setComputedAlign] = useState<'left' | 'right'>(
    align === 'right' ? 'right' : 'left'
  );

  // Close on outside click or window scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleScroll = (event: Event) => {
      if (containerRef.current && containerRef.current.contains(event.target as Node)) {
        return;
      }
      onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [isOpen, onClose]);

  // Compute alignment
  useEffect(() => {
    if (!isOpen) return;
    if (align === 'left' || align === 'right') {
      setComputedAlign(align);
      return;
    }

    if (containerRef.current?.parentElement) {
      const parentRect = containerRef.current.parentElement.getBoundingClientRect();
      const spaceOnRight = window.innerWidth - parentRect.left;
      if (spaceOnRight < 280 && parentRect.right > 280) {
        setComputedAlign('right');
      } else {
        setComputedAlign('left');
      }
    }
  }, [isOpen, align]);

  // Sync viewDate when value or isOpen changes
  useEffect(() => {
    if (isOpen) {
      if (value) {
        const parsed = new Date(value);
        if (!isNaN(parsed.getTime())) {
          setViewDate(parsed);
          return;
        }
      }
      setViewDate(new Date());
    }
  }, [isOpen, value]);

  if (!isOpen) return null;

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Check if a day is the selected date
  const isDateSelected = (day: number) => {
    if (!value) return false;
    const y = year;
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const currentYMD = `${y}-${m}-${d}`;

    const match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) {
      const valYMD = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
      return currentYMD === valYMD;
    }
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      const valYMD = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
      return currentYMD === valYMD;
    }
    return false;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const handleDateClick = (day: number) => {
    const y = year;
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    onChange(dateStr);
    onClose();
  };

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-label="Calendar Date Picker"
      className={`absolute ${computedAlign === 'right' ? 'right-0' : 'left-0'} top-full mt-1.5 bg-white border border-slate-200/80 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in select-none text-slate-800 p-3.5 w-[276px]`}
      style={{
        boxShadow: '0 16px 28px -4px rgba(15, 23, 42, 0.12), 0 6px 12px -3px rgba(15, 23, 42, 0.05)',
      }}
    >
      {/* Month & Year Navigation Header */}
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <span className="text-[14px] font-bold text-slate-900 tracking-tight">
          {monthName}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Previous month"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Next month"
            aria-label="Next month"
          >
            <ChevronRight size={16} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[11px] font-semibold text-slate-400">
        {daysOfWeek.map((d) => (
          <span key={d} className="py-0.5">
            {d}
          </span>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Empty cells for month offset */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="w-8 h-8" />
        ))}

        {/* Month Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const selected = isDateSelected(day);
          const today = isToday(day);

          return (
            <button
              key={`day-${day}`}
              type="button"
              onClick={() => handleDateClick(day)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] transition-all cursor-pointer ${
                selected
                  ? 'bg-[#4F46E5] text-white font-bold shadow-xs scale-105 z-10'
                  : 'bg-[#EEF2FF] text-[#1E1B4B] hover:bg-[#E0E7FF] hover:text-[#1E1B4B] font-semibold'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SingleDatePicker;
