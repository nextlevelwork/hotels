'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface SearchBarProps {
  variant?: 'hero' | 'compact';
  defaultCity?: string;
  className?: string;
}

export default function SearchBar({ variant = 'hero', defaultCity = '', className }: SearchBarProps) {
  const router = useRouter();
  const [city, setCity] = useState(defaultCity);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests && guests !== '2') params.set('guests', guests);
    router.push(`/search?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2 bg-white rounded-xl border border-border p-2 shadow-sm', className)}>
        <div className="flex items-center gap-2 flex-1 px-3">
          <MapPin className="h-4 w-4 text-muted shrink-0" />
          <input
            type="text"
            placeholder="Город или отель"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full text-sm outline-none placeholder:text-muted/60"
          />
        </div>
        <Button size="sm" onClick={handleSearch}>
          <Search className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-2xl shadow-xl border border-border p-3 sm:p-4', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] gap-3">
        {/* City */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus-within:border-primary/30 focus-within:bg-white transition-colors">
          <MapPin className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted mb-0.5">Куда</label>
            <input
              type="text"
              placeholder="Город или отель"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full text-sm font-medium outline-none bg-transparent placeholder:text-muted/60"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus-within:border-primary/30 focus-within:bg-white transition-colors">
          <Calendar className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-muted mb-0.5">Заезд</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full text-sm font-medium outline-none bg-transparent"
              />
            </div>
            <div className="w-px bg-border" />
            <div className="flex-1">
              <label className="block text-xs font-medium text-muted mb-0.5">Выезд</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full text-sm font-medium outline-none bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Guests */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus-within:border-primary/30 focus-within:bg-white transition-colors">
          <Users className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted mb-0.5">Гости</label>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full text-sm font-medium outline-none bg-transparent cursor-pointer"
            >
              <option value="1">1 гость</option>
              <option value="2">2 гостя</option>
              <option value="3">3 гостя</option>
              <option value="4">4 гостя</option>
              <option value="5">5+ гостей</option>
            </select>
          </div>
        </div>

        {/* Search Button */}
        <Button size="lg" onClick={handleSearch} className="h-full min-h-[52px]">
          <Search className="h-5 w-5 sm:mr-2" />
          <span className="hidden sm:inline">Найти</span>
        </Button>
      </div>
    </div>
  );
}
