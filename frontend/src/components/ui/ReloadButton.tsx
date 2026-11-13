import React from 'react';
import { RotateCw } from 'lucide-react';

export interface ReloadButtonProps {
  onClick: () => void;
  isRefreshing?: boolean;
  disabled?: boolean;
  title?: string;
  ariaLabel?: string;
  className?: string;
}

export const ReloadButton: React.FC<ReloadButtonProps> = ({
  onClick,
  isRefreshing = false,
  disabled = false,
  title = 'Refresh',
  ariaLabel,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isRefreshing}
      title={title}
      aria-label={ariaLabel || title}
      className={`p-1.5 rounded-md text-[#64748B] hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center shrink-0 ${className}`.trim()}
    >
      <RotateCw
        className={`w-3.5 h-3.5 stroke-[1.75] ${
          isRefreshing ? 'animate-spin text-[#4F46E5]' : ''
        }`}
      />
    </button>
  );
};

