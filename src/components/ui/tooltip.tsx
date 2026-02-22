'use client';

/**
 * Tooltip Component
 * Simple tooltip implementation for displaying help text on hover
 */

import { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  children: ReactNode;
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function Tooltip({
  children,
  content,
  side = 'right',
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-md shadow-lg whitespace-nowrap pointer-events-none',
            sideClasses[side],
            className
          )}
        >
          {content}
          {/* Arrow */}
          <div
            className={cn(
              'absolute w-2 h-2 bg-gray-900 transform rotate-45',
              side === 'right' && '-left-1 top-1/2 -translate-y-1/2',
              side === 'left' && '-right-1 top-1/2 -translate-y-1/2',
              side === 'top' && 'left-1/2 -translate-x-1/2 -bottom-1',
              side === 'bottom' && 'left-1/2 -translate-x-1/2 -top-1'
            )}
          />
        </div>
      )}
    </div>
  );
}
