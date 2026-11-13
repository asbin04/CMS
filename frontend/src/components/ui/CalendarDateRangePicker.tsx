import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check } from 'lucide-react';

export interface CalendarDateRangePickerProps {
  value?: string;
  onChange: (rangeStr: string) => void;
  isOpen: boolean;
  onClose: () => void;
  showPresets?: boolean;
}

export const CalendarDateRangePicker: React.FC<CalendarDateRangePickerProps> = ({
  value = '',
  onChange,
  isOpen,
  onClose,
  showPresets = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const initialRange = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return {
      start: new Date(currentYear, 3, 1), // 1 Apr
      end: new Date(currentYear + 1, 2, 31), // 31 Mar next year
    };
  }, []);

  const [startDate, setStartDate] = useState<Date | null>(initialRange.start);
  const [endDate, setEndDate] = useState<Date | null>(initialRange.end);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Month navigation (defaults to today / current month)
  const [viewDate, setViewDate] = useState<Date>(new Date());

  // Close on outside click or window scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleScroll = (event: Event) => {
      // Don't close if scrolling inside the picker itself
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

  // Presets list
  const currentYear = new Date().getFullYear();
  const presets = [
    { label: `Apr ${currentYear - 2} - Mar ${currentYear - 1}`, start: new Date(currentYear - 2, 3, 1), end: new Date(currentYear - 1, 2, 31) },
    { label: `Apr ${currentYear - 1} - Mar ${currentYear}`, start: new Date(currentYear - 1, 3, 1), end: new Date(currentYear, 2, 31) },
    { label: `Apr ${currentYear} - Mar ${currentYear + 1}`, start: new Date(currentYear, 3, 1), end: new Date(currentYear + 1, 2, 31) },
    { label: `Jan ${currentYear} - Dec ${currentYear}`, start: new Date(currentYear, 0, 1), end: new Date(currentYear, 11, 31) },
    {
      label: 'Last 30 Days',
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
    },
    {
      label: 'This Quarter',
      start: new Date(currentYear, Math.floor(new Date().getMonth() / 3) * 3, 1),
      end: new Date(currentYear, Math.floor(new Date().getMonth() / 3) * 3 + 3, 0),
    },
  ];

  const handleDateClick = (day: number) => {
    const clicked = new Date(year, month, day);

    if (!startDate || (startDate && endDate)) {
      setStartDate(clicked);
      setEndDate(null);
      setHoverDate(null);
    } else if (startDate && !endDate) {
      if (clicked < startDate) {
        setEndDate(startDate);
        setStartDate(clicked);
      } else {
        setEndDate(clicked);
      }
      setHoverDate(null);
    }
  };

  const isSameDay = (d1: Date | null, d2: Date | null) => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const isSelectedStart = (day: number) => {
    const current = new Date(year, month, day);
    return isSameDay(current, startDate);
  };

  const isSelectedEnd = (day: number) => {
    const current = new Date(year, month, day);
    if (endDate) {
      return isSameDay(current, endDate);
    }
    if (startDate && !endDate && hoverDate) {
      return isSameDay(current, hoverDate);
    }
    return false;
  };

  const isInBetween = (day: number) => {
    const current = new Date(year, month, day);

    if (startDate && endDate) {
      return current > startDate && current < endDate;
    }

    if (startDate && !endDate && hoverDate) {
      const min = startDate < hoverDate ? startDate : hoverDate;
      const max = startDate < hoverDate ? hoverDate : startDate;
      return current > min && current < max;
    }

    return false;
  };

  const formatDateShort = (d: Date) => {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleApply = () => {
    if (startDate && endDate) {
      const startStr = formatDateShort(startDate);
      const endStr = formatDateShort(endDate);
      onChange(`${startStr} - ${endStr}`);
    } else if (startDate && !endDate) {
      const startStr = formatDateShort(startDate);
      onChange(startStr);
    }
    onClose();
  };

  const handlePresetSelect = (preset: typeof presets[0]) => {
    setStartDate(preset.start);
    setEndDate(preset.end);
    setViewDate(new Date(preset.start.getFullYear(), preset.start.getMonth(), 1));
    onChange(preset.label);
    onClose();
  };

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-label="Date Range Picker"
      className="absolute right-0 top-full mt-2 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in select-none text-slate-800"
      style={{
        boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
      }}
    >
      <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {/* Left column: Quick Period Presets */}
        {showPresets && (
          <div className="w-full sm:w-[190px] bg-[#F8FAFC] p-3 flex flex-col justify-between shrink-0">
            <div>
              <div className="px-2.5 py-1 text-[10.5px] font-bold tracking-wider text-[#64748B] uppercase">
                Select Period
              </div>
              <div className="mt-1 space-y-0.5">
                {presets.map((preset) => {
                  const isSelected = value === preset.label;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 text-[#4F46E5] font-semibold'
                          : 'text-slate-700 hover:bg-slate-200/60'
                      }`}
                    >
                      <span className="truncate">{preset.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#4F46E5] shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/70 px-1 text-[11px] text-slate-500 flex items-center gap-1.5">
              <CalendarIcon size={13} className="text-slate-400 shrink-0" />
              <span>Or pick custom dates</span>
            </div>
          </div>
        )}

        {/* Right column: Interactive Calendar Grid */}
        <div className="p-4 w-[300px]">
          {/* Month & Year Navigation Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[13.5px] font-bold text-slate-900 tracking-tight">
              {monthName}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Previous month"
                aria-label="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Next month"
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center mb-1 text-[11px] font-semibold text-slate-400">
            {daysOfWeek.map((d) => (
              <span key={d} className="py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div
            className="grid grid-cols-7 gap-1 text-center text-xs"
            onMouseLeave={() => setHoverDate(null)}
          >
            {/* Empty cells for month offset */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="w-8 h-8" />
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isStart = isSelectedStart(day);
              const isEnd = isSelectedEnd(day);
              const inBetween = isInBetween(day);

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  onMouseEnter={() => {
                    if (startDate && !endDate) {
                      setHoverDate(new Date(year, month, day));
                    }
                  }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all relative cursor-pointer ${
                    isStart || isEnd
                      ? 'bg-[#4F46E5] text-white font-bold shadow-xs scale-105 z-10'
                      : inBetween
                      ? 'bg-indigo-50 text-indigo-900 font-semibold rounded-md'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer: Date Range preview & Actions */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-600 font-medium truncate max-w-[145px]" title={startDate ? `${formatDateShort(startDate)} → ${endDate ? formatDateShort(endDate) : '...'}` : 'Select dates'}>
              {startDate ? formatDateShort(startDate) : 'Start'}
              {' → '}
              {endDate ? formatDateShort(endDate) : hoverDate ? formatDateShort(hoverDate) : 'End'}
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-2 py-1 text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!startDate}
                className="px-3 py-1 bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs text-xs transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarDateRangePicker;
