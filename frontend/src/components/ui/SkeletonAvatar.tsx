import React from 'react';
import { Skeleton } from './Skeleton';

export interface SkeletonAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  rounded?: 'full' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64
};

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = 'md',
  rounded = 'full',
  className = ''
}) => {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 40;

  return (
    <Skeleton
      variant="circular"
      width={pixelSize}
      height={pixelSize}
      rounded={rounded}
      className={`shrink-0 ${className}`}
    />
  );
};
