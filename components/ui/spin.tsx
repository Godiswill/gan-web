'use client';

import { cn } from '@/lib/utils';

interface SpinProps {
  spinning?: boolean;
  fullscreen?: boolean;
  tip?: string;
  size?: 'small' | 'default' | 'large';
  className?: string;
  children?: React.ReactNode;
}

export function Spin({
  spinning = true,
  fullscreen = false,
  tip,
  size = 'default',
  className,
  children,
}: SpinProps) {
  const sizeMap = {
    small: 'h-4 w-4',
    default: 'h-6 w-6',
    large: 'h-10 w-10',
  };

  const spinner = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 text-muted-foreground',
        fullscreen && 'fixed inset-0 bg-background/60 backdrop-blur-sm z-50',
        className
      )}
    >
      {/* <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className={cn('animate-spin text-primary', sizeMap[size])} />
      </motion.div> */}
      <div
        className={cn(
          'inline-block border-4 border-primary border-t-transparent dark:border-white dark:border-t-transparent rounded-full animate-spin mb-2',
          sizeMap[size]
        )}
      ></div>

      {tip && <div className="text-sm text-muted-foreground">{tip}</div>}
    </div>
  );

  if (children) {
    return (
      <div className="relative">
        <div className={cn(spinning ? 'opacity-30 pointer-events-none' : '')}>
          {children}
        </div>
        {spinning && (
          <div className="absolute inset-0 flex items-center justify-center">
            {spinner}
          </div>
        )}
      </div>
    );
  }

  return spinning ? spinner : null;
}
