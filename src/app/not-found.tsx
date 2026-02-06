'use client';

import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-primary/20 mb-4">404</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Страница не найдена
        </h1>
        <p className="text-muted mb-8">
          Возможно, страница была удалена или вы перешли по неверной ссылке.
          Попробуйте вернуться на главную или найти нужный отель.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="outline">
              <Home className="h-4 w-4 mr-2" />
              На главную
            </Button>
          </Link>
          <Link href="/search">
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Найти отель
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
