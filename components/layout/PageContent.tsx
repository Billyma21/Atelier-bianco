import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
  wide?: boolean;
};

/** Espacement sous le header fixe + marges latérales mobile-first. */
export default function PageContent({ children, className, narrow, wide }: Props) {
  return (
    <div
      className={cn(
        'page-content mx-auto w-full',
        narrow && 'max-w-screen-md',
        wide && 'max-w-screen-xl',
        !narrow && !wide && 'max-w-screen-2xl',
        className
      )}
    >
      {children}
    </div>
  );
}
