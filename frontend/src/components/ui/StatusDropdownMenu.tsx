import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface StatusItemConfig {
  value: string;
  label?: string;
  dotColor: string;
  textColor?: string;
}

export interface StatusDropdownMenuProps {
  currentStatus: string;
  options: StatusItemConfig[];
  onSelect: (newStatus: string) => void;
  headerTitle?: string;
  disabled?: boolean;
  triggerVariant?: 'default' | 'badge' | string;
  getBadgeClass?: (currentStatus: string) => string;
}

export const StatusDropdownMenu: React.FC<StatusDropdownMenuProps> = ({
  currentStatus,
  options,
  onSelect,
  headerTitle = 'CHANGE STATE',
  disabled = false,
  triggerVariant = 'default',
  getBadgeClass,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Derive active option or fallback
  const activeOption = options.find(
    (opt) => opt.value.toLowerCase() === currentStatus?.toLowerCase()
  ) || {
    value: currentStatus,
    label: currentStatus,
    dotColor: '#F59E0B',
    textColor: '#D97706',
  };

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (disabled) return;

    if (isOpen) {
      setIsOpen(false);
      setMenuPos(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 36 + options.length * 32;
    const openUpward = rect.bottom + dropdownHeight > window.innerHeight;

    setMenuPos({
      top: openUpward ? Math.max(8, rect.top - dropdownHeight - 4) : rect.bottom + 4,
      left: Math.max(8, Math.min(rect.left - 4, window.innerWidth - 160)),
    });
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (buttonRef.current && buttonRef.current.contains(e.target as Node)) {
        return;
      }
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) {
        return;
      }
      setIsOpen(false);
      setMenuPos(null);
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
      setMenuPos(null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setMenuPos(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, { capture: true, passive: true });
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Trigger Button: Approval Inbox style (default) or Badge style */}
      {triggerVariant === 'badge' ? (
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={handleToggle}
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer select-none hover:opacity-90 active:scale-95 ${
            getBadgeClass ? getBadgeClass(currentStatus) : 'bg-slate-100 text-slate-700'
          }`}
          title={disabled ? undefined : 'Click to change state'}
        >
          <span>{activeOption.label || activeOption.value}</span>
          {!disabled && (
            <ChevronDown
              size={11}
              className={`opacity-70 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
            />
          )}
        </button>
      ) : (
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={handleToggle}
          className="flex items-center gap-1.5 px-2 py-1 -ml-1 rounded-md hover:bg-slate-100 transition-colors group cursor-pointer border-none bg-transparent select-none"
          title={disabled ? undefined : 'Click to change state'}
          style={{
            cursor: disabled ? 'default' : 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: activeOption.dotColor }}
          />
          <span
            className="text-xs font-medium whitespace-nowrap"
            style={{ color: activeOption.textColor }}
          >
            {activeOption.label || activeOption.value}
          </span>
          {!disabled && (
            <ChevronDown
              size={11}
              className={`text-slate-400 opacity-60 group-hover:opacity-100 transition-all ${
                isOpen ? 'rotate-180 opacity-100' : ''
              }`}
            />
          )}
        </button>
      )}

      {/* Floating Popover: Exactly matching Approval Inbox page */}
      {isOpen && menuPos && (
        <div
          ref={dropdownRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: `${menuPos.top}px`,
            left: `${menuPos.left}px`,
            width: 'max-content',
            minWidth: '136px',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            padding: '4px',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            animation: 'fadeIn 0.12s ease',
          }}
        >
          <span
            className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 select-none"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {headerTitle}
          </span>
          {options.map((opt) => {
            const isCurrent = opt.value.toLowerCase() === currentStatus?.toLowerCase();
            return (
              <button
                key={opt.value}
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(opt.value);
                  setIsOpen(false);
                  setMenuPos(null);
                }}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer select-none border-none ${
                  isCurrent
                    ? 'bg-indigo-50 font-bold text-indigo-700'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: opt.dotColor }}
                />
                <span className="whitespace-nowrap">{opt.label || opt.value}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
