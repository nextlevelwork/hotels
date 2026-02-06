'use client';

import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useFavoritesStore } from '@/store/favorites-store';
import { useToastStore } from '@/store/toast-store';

interface FavoriteButtonProps {
  slug: string;
  mode?: 'icon' | 'text';
  className?: string;
}

export default function FavoriteButton({ slug, mode = 'icon', className }: FavoriteButtonProps) {
  const toggle = useFavoritesStore((s) => s.toggle);
  const isFavorite = useFavoritesStore((s) => s.slugs.includes(slug));
  const addToast = useToastStore((s) => s.add);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(slug);
    addToast(
      'success',
      isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное',
    );
  };

  if (mode === 'text') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors cursor-pointer',
          isFavorite
            ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
            : 'border-border bg-white text-muted hover:bg-gray-50',
          className,
        )}
        aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
      >
        <motion.span
          key={String(isFavorite)}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          <Heart className={cn('h-5 w-5', isFavorite && 'fill-current')} />
        </motion.span>
        <span className="text-sm font-medium">
          {isFavorite ? 'В избранном' : 'В избранное'}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'p-2 rounded-full transition-colors cursor-pointer',
        isFavorite
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-white/80 text-gray-600 hover:bg-white backdrop-blur-sm',
        className,
      )}
      aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
    >
      <motion.span
        key={String(isFavorite)}
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="block"
      >
        <Heart className={cn('h-5 w-5', isFavorite && 'fill-current')} />
      </motion.span>
    </button>
  );
}
