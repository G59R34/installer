import React, { FC } from 'react';
import cn from 'renderer/utils/cn';

export interface SkeletonProps {
  className?: string;
}

/** High-contrast-safe shimmer placeholder; reserves layout to reduce jumps. */
export const Skeleton: FC<SkeletonProps> = ({ className }) => (
  <div className={cn('animate-pulse rounded-md bg-navy-light/35 motion-reduce:animate-none', className)} aria-hidden />
);
