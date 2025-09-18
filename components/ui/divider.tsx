import * as React from 'react';
import { cn } from '@/lib/utils'; // 你项目里的 classnames 工具，或用 clsx

export type DividerProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode; // 中间文字
  orientation?: 'horizontal' | 'vertical';
  align?: 'center' | 'start' | 'end';
  size?: 'sm' | 'md' | 'lg'; // 线的高度/长度感
  decorative?: boolean; // 如果只做装饰则 true，不需要 aria-label
};

export function Divider({
  className,
  children,
  orientation = 'horizontal',
  align = 'center',
  size = 'md',
  decorative = false,
  ...props
}: DividerProps) {
  const isVertical = orientation === 'vertical';

  // 线高/线宽映射
  const thickness =
    size === 'sm' ? 'h-[1px]' : size === 'lg' ? 'h-[2px]' : 'h-[1px]';
  const vThickness =
    size === 'sm' ? 'w-[1px]' : size === 'lg' ? 'w-[2px]' : 'w-[1px]';

  if (isVertical) {
    // 垂直分割线（可带文字则文字靠上/下较少见）
    return (
      <div
        role={decorative ? undefined : 'separator'}
        aria-orientation="vertical"
        className={cn('inline-flex items-stretch', className)}
        {...props}
      >
        <div
          className={cn(
            'bg-border/70 dark:bg-border/60', // 线色：支持暗色
            vThickness
          )}
        />
      </div>
    );
  }

  // 横向带文字/无文字
  // 对齐方式处理： start => text 左靠, end => 右靠, center => 居中
  const leftFlex =
    align === 'center' ? 'flex-1' : align === 'start' ? 'flex-none' : 'flex-1';
  const rightFlex =
    align === 'center' ? 'flex-1' : align === 'end' ? 'flex-none' : 'flex-1';
  const leftLineClass = cn(
    leftFlex,
    thickness,
    'bg-border/70 dark:bg-border/60'
  );
  const rightLineClass = cn(
    rightFlex,
    thickness,
    'bg-border/70 dark:bg-border/60'
  );

  // 中间文字背景需要和页面背景一致，以“切割”线条，使用 CSS 变量以兼容 shadcn 主题
  // shadcn 通常提供 --background 或类名 bg-background
  const textBgClass = 'px-3 text-sm text-muted-foreground';

  return (
    <div
      role={decorative ? undefined : 'separator'}
      aria-orientation="horizontal"
      className={cn('flex items-center', className)}
      {...props}
    >
      {/* left line */}
      <span className={leftLineClass} />

      {/* text area (如果没有 children，隐藏中间块，使两条线连在一起) */}
      {children ? (
        <span
          className={cn(
            'mx-3',
            'inline-flex items-center',
            // 使用背景变量，兼容 shadcn 的 light/dark
            // bg-[var(--background)] 会覆盖线条从而产生断开的中间区域（看起来像 Ant Divider）
            // 'bg-[var(--background)] dark:bg-[var(--background)]',
            textBgClass
          )}
        >
          {children}
        </span>
      ) : (
        // 如果没有文字，则两条线应接近
        <span className="hidden" />
      )}

      {/* right line */}
      <span className={rightLineClass} />
    </div>
  );
}

export default Divider;
