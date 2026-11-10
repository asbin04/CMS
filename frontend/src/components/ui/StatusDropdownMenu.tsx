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
  triggerVariant?: 'default' | 'badge';
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

  // Find active option configuration or fallback (case-insensitive)
  const activeOption = options.find(
    (opt) => opt.value.toLowerCase() === currentStatus?.toLowerCase()
  ) || {
    value: currentStatus,
    label: currentStatus,
    dotColor: '#64748B',
    textColor: '#334155',
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
    const dropdownHeight = 36 + options.length * 34;
    const openUpward = rect.bottom + dropdownHeight > window.innerHeight;

    setMenuPos({
      top: openUpward ? Math.max(8, rect.top - dropdownHeight - 4) : rect.bottom + 4,
      left: Math.max(10, Math.min(rect.left - 4, window.innerWidth - 180)),
    });
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        buttonRef.current &&
        buttonRef.current.contains(e.target as Node)
      ) {
        return;
      }
      if (
        dropdownRef.current &&
        dropdownRef.current.contains(e.target as Node)
      ) {
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
      {/* Trigger Button: either Badge or Default (• Label v) */}
      {triggerVariant === 'badge' ? (
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={handleToggle}
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer select-none hover:opacity-90 active:scale-95 ${
            getBadgeClass ? getBadgeClass(currentStatus) : 'bg-slate-100 text-slate-700'
          }`}
          title="Click to change"
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
          className="flex items-center gap-1.5 px-2 py-1 -ml-2 rounded-md hover:bg-slate-100 transition-colors group cursor-pointer border-none bg-transparent select-none"
          title="Click to change state"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            marginLeft: '-4px',
            borderRadius: '6px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: disabled ? 'default' : 'pointer',
            fontFamily: "'Inter', sans-serif",
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!disabled) e.currentTarget.style.backgroundColor = '#F1F5F9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {/* Status Dot */}
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '9999px',
              backgroundColor: activeOption.dotColor,
              flexShrink: 0,
              display: 'inline-block',
            }}
          />

          {/* Status Text */}
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              lineHeight: '16px',
              color: activeOption.textColor || '#0F172A',
              whiteSpace: 'nowrap',
            }}
          >
            {activeOption.label || activeOption.value}
          </span>

          {/* Chevron Icon */}
          {!disabled && (
            <ChevronDown
              size={12}
              color="#94A3B8"
              style={{
                opacity: 0.7,
                transition: 'transform 0.15s ease, opacity 0.15s ease',
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          )}
        </button>
      )}

      {/* Floating Popover Menu */}
      {isOpen && menuPos && (
        <div
          ref={dropdownRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: `${menuPos.top}px`,
            left: `${menuPos.left}px`,
            width: 'max-content',
            minWidth: '154px',
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            padding: '6px',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            animation: 'fadeIn 0.12s ease',
          }}
        >
          {/* Header */}
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#94A3B8',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '4px 8px 3px 8px',
              fontFamily: "'Inter', sans-serif",
              userSelect: 'none',
            }}
          >
            {headerTitle}
          </span>

          {/* Option list */}
          {options.map((opt) => {
            const isCurrent = opt.value.toLowerCase() === currentStatus?.toLowerCase();
            return (
              <button
                key={opt.value}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(opt.value);
                  setIsOpen(false);
                  setMenuPos(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '6px 8px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: isCurrent ? '#EEF2FF' : 'transparent',
                  color: isCurrent ? '#4338CA' : '#334155',
                  fontSize: '12px',
                  fontWeight: isCurrent ? 700 : 500,
                  lineHeight: '16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'background-color 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent) e.currentTarget.style.backgroundColor = '#F8FAFC';
                }}
                onMouseLeave={(e) => {
                  if (!isCurrent) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Dot */}
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '9999px',
                    backgroundColor: opt.dotColor,
                    flexShrink: 0,
                    display: 'inline-block',
                  }}
                />
                {/* Label */}
                <span style={{ whiteSpace: 'nowrap' }}>{opt.label || opt.value}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
