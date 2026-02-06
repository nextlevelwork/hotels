import { cn } from '@/lib/utils';

interface RatingBadgeProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getRatingColor(rating: number): string {
  if (rating >= 9) return 'bg-primary text-white';
  if (rating >= 8) return 'bg-primary-light text-white';
  if (rating >= 7) return 'bg-success text-white';
  return 'bg-warning text-white';
}

function getRatingText(rating: number): string {
  if (rating >= 9) return 'Превосходно';
  if (rating >= 8) return 'Отлично';
  if (rating >= 7) return 'Хорошо';
  return 'Нормально';
}

export default function RatingBadge({ rating, size = 'md', className }: RatingBadgeProps) {
  return (
    <div className={cn('flex items-center gap-2', className)} aria-label={`Оценка ${rating}`}>
      <div
        className={cn(
          'rounded-lg font-bold flex items-center justify-center',
          getRatingColor(rating),
          {
            'w-8 h-8 text-sm': size === 'sm',
            'w-10 h-10 text-base': size === 'md',
            'w-12 h-12 text-lg': size === 'lg',
          }
        )}
      >
        {rating.toFixed(1)}
      </div>
      {size !== 'sm' && (
        <span className="text-sm text-muted">{getRatingText(rating)}</span>
      )}
    </div>
  );
}
