'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Search, Heart, User, Home, Building2, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const navRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !navRef.current) return;

    const nav = navRef.current;
    const focusableSelector = 'a, button, [tabindex]:not([tabindex="-1"])';

    // Focus first element on open
    const firstFocusable = nav.querySelector(focusableSelector) as HTMLElement | null;
    setTimeout(() => firstFocusable?.focus(), 50);

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = nav.querySelectorAll(focusableSelector);
      if (focusable.length === 0) return;

      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    nav.addEventListener('keydown', handleTab);
    return () => nav.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={navRef}
      className="md:hidden border-t border-border bg-white"
      role="dialog"
      aria-modal="true"
      aria-label="Навигация"
    >
      <nav className="px-4 py-4 space-y-1">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-gray-50 transition-colors"
        >
          <Home className="h-5 w-5 text-muted" />
          <span className="font-medium">Главная</span>
        </Link>
        <Link
          href="/search"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-gray-50 transition-colors"
        >
          <Search className="h-5 w-5 text-muted" />
          <span className="font-medium">Поиск отелей</span>
        </Link>
        <Link
          href="/#collections"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-gray-50 transition-colors"
        >
          <Bookmark className="h-5 w-5 text-muted" />
          <span className="font-medium">Подборки</span>
        </Link>
        <button
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-gray-50 transition-colors w-full cursor-pointer"
        >
          <Heart className="h-5 w-5 text-muted" />
          <span className="font-medium">Избранное</span>
        </button>
        <div className="pt-2 border-t border-border mt-2">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-gray-50 transition-colors w-full cursor-pointer">
            <User className="h-5 w-5 text-muted" />
            <span className="font-medium">Войти</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
