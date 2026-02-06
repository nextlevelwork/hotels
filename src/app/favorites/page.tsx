'use client';

import Link from 'next/link';
import { Heart, Search } from 'lucide-react';
import { useFavoritesStore } from '@/store/favorites-store';
import { allHotels } from '@/data/hotels';
import HotelCard from '@/components/search/HotelCard';

export default function FavoritesPage() {
  const slugs = useFavoritesStore((s) => s.slugs);
  const hotels = allHotels.filter((h) => slugs.includes(h.slug));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-6 w-6 text-red-500" />
        <h1 className="text-2xl font-bold">Избранное</h1>
        {hotels.length > 0 && (
          <span className="text-sm text-muted">({hotels.length})</span>
        )}
      </div>

      {hotels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel, i) => (
            <HotelCard key={hotel.slug} hotel={hotel} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Heart className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Пока пусто</h2>
          <p className="text-muted mb-6">
            Добавляйте понравившиеся отели в избранное, нажимая на сердечко
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            <Search className="h-5 w-5" />
            Найти отель
          </Link>
        </div>
      )}
    </div>
  );
}
