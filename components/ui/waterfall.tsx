import * as React from 'react';
import { cn } from '@/lib/utils';

export interface WaterfallProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  minColumnWidth?: string;
  gap?: string;
}

export function Waterfall({
  children,
  minColumnWidth = '18rem',
  gap = '1rem',
  className,
  ...props
}: WaterfallProps) {
  return (
    <div
      className={cn('waterfall', className)}
      style={{
        columnWidth: minColumnWidth,
        columnGap: gap,
      }}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <div key={index} className="break-inside-avoid mb-4">
          {child}
        </div>
      ))}
    </div>
  );
}
