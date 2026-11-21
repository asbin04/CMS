import React from 'react';
import { Upload } from 'lucide-react';

export interface ExportButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  label?: string;
  title?: string;
  className?: string;
  dataTestId?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onClick,
  disabled = false,
  label = 'Export',
  title = 'Export',
  className = '',
  dataTestId,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      data-testid={dataTestId}
      className={`box-border inline-flex items-center justify-center gap-1.5 px-3 py-1.5 h-[34px] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] active:bg-slate-100 text-[#334155] rounded-[8px] text-[12px] font-semibold leading-4 transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0 whitespace-nowrap ${className}`.trim()}
    >
      <Upload className="w-3.5 h-3.5 text-[#334155] stroke-[2]" />
      <span>{label}</span>
    </button>
  );
};
