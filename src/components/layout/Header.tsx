'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Search, User, Heart, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import MobileNav from './MobileNav';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Гостинец
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/search" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
              Поиск отелей
            </Link>
            <Link href="/#collections" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
              Подборки
            </Link>
            <Link href="/#how-it-works" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
              Как это работает
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/search"
              className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-gray-100 transition-colors"
            >
              <Search className="h-5 w-5" />
            </Link>
            <button className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-gray-100 transition-colors cursor-pointer">
              <Heart className="h-5 w-5" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">Войти</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-muted hover:text-foreground hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
