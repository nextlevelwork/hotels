'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Search } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function HotelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Hotel page error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-danger" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Не удалось загрузить отель
        </h1>
        <p className="text-muted mb-8">
          Произошла ошибка при загрузке данных отеля. Попробуйте обновить страницу или выберите другой отель.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Попробовать снова
          </Button>
          <Link href="/search">
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Найти другой отель
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
