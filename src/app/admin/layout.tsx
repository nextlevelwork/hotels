'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Users, MessageSquare, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Бронирования', icon: BookOpen },
  { href: '/admin/reviews', label: 'Отзывы', icon: MessageSquare },
  { href: '/admin/users', label: 'Пользователи', icon: Users },
  { href: '/admin/loyalty', label: 'Лояльность', icon: Gift },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <div className="min-h-[calc(100vh-80px)]">
      {/* Mobile tabs */}
      <div className="md:hidden border-b border-border bg-white sticky top-0 z-30">
        <nav className="flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors',
                  active
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-60 shrink-0 border-r border-border bg-white min-h-[calc(100vh-80px)]">
          <nav className="flex flex-col gap-1 p-4 w-full">
            <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 px-3">
              Админ-панель
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-gray-50'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
