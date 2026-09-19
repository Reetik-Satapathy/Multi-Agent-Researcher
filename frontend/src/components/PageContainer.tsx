import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn('w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8', className)}>
      {children}
    </div>
  );
}
