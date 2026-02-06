import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({ children, className, hover = false, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'bg-card rounded-xl border border-border shadow-sm',
        hover && 'transition-all duration-200 hover:shadow-md hover:border-primary/20',
        {
          '': padding === 'none',
          'p-3': padding === 'sm',
          'p-5': padding === 'md',
          'p-7': padding === 'lg',
        },
        className
      )}
    >
      {children}
    </div>
  );
}
