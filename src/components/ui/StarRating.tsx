import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export default function StarRating({ rating, maxStars = 5, size = 'md', showValue = false, className }: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4.5 w-4.5',
    lg: 'h-5.5 w-5.5',
  };

  return (
    <div role="img" aria-label={`Рейтинг: ${rating} из ${maxStars}`} className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: maxStars }, (_, i) => (
        <Star
          key={i}
          className={cn(
            sizeClasses[size],
            i < Math.floor(rating)
              ? 'fill-warning text-warning'
              : i < rating
                ? 'fill-warning/50 text-warning'
                : 'fill-gray-200 text-gray-200'
          )}
        />
      ))}
      {showValue && (
        <span className={cn('ml-1 font-semibold text-foreground', size === 'sm' ? 'text-xs' : 'text-sm')}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
