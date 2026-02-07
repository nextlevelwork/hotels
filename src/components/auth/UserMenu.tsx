'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { User, BookOpen, Heart, LogOut } from 'lucide-react';

export default function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!session?.user) return null;

  const initials = (session.user.name || session.user.email || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center hover:bg-primary-dark transition-colors cursor-pointer"
        aria-label="Меню пользователя"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-border shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-border">
            <div className="font-medium text-sm truncate">{session.user.name}</div>
            <div className="text-xs text-muted truncate">{session.user.email}</div>
          </div>

          <nav className="py-1">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-gray-50 transition-colors"
            >
              <User className="h-4 w-4 text-muted" />
              Профиль
            </Link>
            <Link
              href="/profile/bookings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-gray-50 transition-colors"
            >
              <BookOpen className="h-4 w-4 text-muted" />
              Мои бронирования
            </Link>
            <Link
              href="/favorites"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-gray-50 transition-colors"
            >
              <Heart className="h-4 w-4 text-muted" />
              Избранное
            </Link>
          </nav>

          <div className="border-t border-border pt-1">
            <button
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: '/' });
              }}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-gray-50 transition-colors w-full cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Выйти
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
