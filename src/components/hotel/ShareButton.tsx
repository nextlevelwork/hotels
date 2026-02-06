'use client';

import { Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/store/toast-store';

interface ShareButtonProps {
  title: string;
  text?: string;
  className?: string;
}

export default function ShareButton({ title, text, className }: ShareButtonProps) {
  const addToast = useToastStore((s) => s.add);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        if ((err as DOMException).name !== 'AbortError') {
          await copyToClipboard(url);
        }
      }
    } else {
      await copyToClipboard(url);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      addToast('success', 'Ссылка скопирована');
    } catch {
      addToast('error', 'Не удалось скопировать ссылку');
    }
  };

  return (
    <button
      onClick={handleShare}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-white text-muted hover:bg-gray-50 transition-colors cursor-pointer',
        className,
      )}
      aria-label="Поделиться"
    >
      <Share2 className="h-5 w-5" />
      <span className="text-sm font-medium">Поделиться</span>
    </button>
  );
}
