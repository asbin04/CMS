import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';

export interface TableActionMenuItem {
  key?: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  hasDividerAbove?: boolean;
}

export interface TableActionMenuProps {
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  onViewDetails?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  items?: TableActionMenuItem[];
  ariaLabel?: string;
  className?: string;
}

export const TableActionMenu: React.FC<TableActionMenuProps> = ({
  isOpen: controlledIsOpen,
  onToggle,
  onClose,
  onViewDetails,
  onEdit,
  onDelete,
  viewLabel = 'View Details',
  editLabel = 'Edit Entry',
  deleteLabel = 'Delete',
  items,
  ariaLabel = 'Actions',
  className = '',
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = typeof controlledIsOpen === 'boolean';
  const open = isControlled ? controlledIsOpen : internalIsOpen;

  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    if (isControlled) {
      onClose?.();
    } else {
      setInternalIsOpen(false);
    }
  };

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = menuRef.current?.offsetHeight || 120;
    const dropdownWidth = menuRef.current?.offsetWidth || 144;
    const vh = typeof window !== 'undefined' ? window.innerHeight || 800 : 800;
    const vw = typeof window !== 'undefined' ? window.innerWidth || 1280 : 1280;

    const spaceBelow = vh - rect.bottom;
    const spaceAbove = rect.top;

    // Open upward if insufficient space below and more space available above
    const openUpward = spaceBelow < dropdownHeight + 10 && spaceAbove > spaceBelow;

    const top = openUpward
      ? Math.max(8, rect.top - dropdownHeight - 4)
      : Math.min(vh - dropdownHeight - 8, rect.bottom + 4);

    const targetRight = vw - rect.right;
    const maxRight = Math.max(8, vw - dropdownWidth - 8);
    const right = Math.max(8, Math.min(targetRight, maxRight));

    setMenuPosition({ top, right });
  };

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    updatePosition();
    if (isControlled) {
      onToggle?.();
    } else {
      setInternalIsOpen((prev) => !prev);
    }
  };

  // Calculate position immediately when opened
  useEffect(() => {
    if (open) {
      updatePosition();
    }
  }, [open]);

  // Refine position if measured height in DOM differs
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
  useIsomorphicLayoutEffect(() => {
    if (open && menuRef.current && buttonRef.current) {
      updatePosition();
    }
  }, [open]);

  // Handle outside clicks, Escape key, and viewport scrolling/resizing
  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      handleClose();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    const handleScrollOrResize = () => {
      if (!buttonRef.current) {
        handleClose();
        return;
      }
      const rect = buttonRef.current.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const vw = window.innerWidth || 1280;

      // Close menu if trigger button is scrolled completely offscreen
      if (rect.bottom < 0 || rect.top > vh || rect.right < 0 || rect.left > vw) {
        handleClose();
      } else {
        updatePosition();
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
  }, [open]);

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={handleToggle}
        className={`p-1 rounded-lg transition-colors cursor-pointer ${
          open
            ? 'text-slate-700 bg-slate-100'
            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
        }`}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-orientation="vertical"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: `${menuPosition.top}px`,
              right: `${menuPosition.right}px`,
              width: '144px',
              zIndex: 99999,
            }}
            className="bg-white rounded-xl border border-slate-200 shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100 select-none text-left"
          >
            {items ? (
              items.map((item, idx) => (
                <React.Fragment key={item.key || idx}>
                  {item.hasDividerAbove && <div className="my-1 border-t border-slate-100" />}
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      item.onClick();
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors text-left cursor-pointer ${
                      item.variant === 'danger'
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                </React.Fragment>
              ))
            ) : (
              <>
                {onViewDetails && (
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      onViewDetails();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{viewLabel}</span>
                  </button>
                )}
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      onEdit();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{editLabel}</span>
                  </button>
                )}
                {(onViewDetails || onEdit) && onDelete && (
                  <div className="my-1 border-t border-slate-100" />
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      onDelete();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>{deleteLabel}</span>
                  </button>
                )}
              </>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};
