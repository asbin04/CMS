import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'badge' | 'button' | 'avatar';
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  rounded,
  animate = true,
  style,
  children,
  ...props
}) => {
  const animationClass = animate ? 'animate-shimmer' : 'bg-slate-200 dark:bg-slate-700/60';

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full'
  };

  const defaultVariantRoundings: Record<string, string> = {
    text: 'rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-2xl',
    badge: 'rounded-full',
    button: 'rounded-lg',
    avatar: 'rounded-full'
  };

  const variantClasses = {
    text: 'h-4',
    circular: 'w-10 h-10',
    rectangular: 'h-10',
    card: 'border border-[#E2E8F0] dark:border-slate-700 p-5 shadow-2xs',
    badge: 'h-5 w-16',
    button: 'h-9 w-24',
    avatar: 'w-9 h-9 shrink-0'
  }[variant];

  const rounding = rounded ? roundedClasses[rounded] : defaultVariantRoundings[variant];

  const computedStyle: React.CSSProperties = {
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    ...style
  };

  if (variant === 'card') {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Loading card..."
        className={`bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between ${className}`}
        style={computedStyle}
        {...props}
      >
        {children ? (
          children
        ) : (
          <div className="flex flex-col justify-between h-full w-full gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1 min-w-0">
                <div className={`h-3 w-1/3 rounded-md ${animationClass}`} />
                <div className={`h-6 w-1/2 rounded-md ${animationClass}`} />
              </div>
              <div className={`w-8 h-8 rounded-lg shrink-0 ${animationClass}`} />
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <div className={`h-4 w-12 rounded-full ${animationClass}`} />
              <div className={`h-3 w-1/4 rounded-md ${animationClass}`} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading..."
      className={`${animationClass} ${variantClasses} ${rounding} ${className}`}
      style={computedStyle}
      {...props}
    >
      {children}
    </div>
  );
};
