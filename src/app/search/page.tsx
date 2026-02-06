'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, MapPin } from 'lucide-react';
import { searchHotels } from '@/lib/api';
import { cn, pluralize } from '@/lib/utils';
import type { Hotel, SearchFilters } from '@/data/types';
import SearchBar from '@/components/search/SearchBar';
import HotelCard from '@/components/search/HotelCard';
import FilterPanel from '@/components/search/FilterPanel';
import SortDropdown from '@/components/search/SortDropdown';
import MapView from '@/components/search/MapView';
import { HotelCardSkeleton } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    city: searchParams.get('city') || undefined,
    checkIn: searchParams.get('checkIn') || undefined,
    checkOut: searchParams.get('checkOut') || undefined,
    guests: searchParams.get('guests') ? Number(searchParams.get('guests')) : undefined,
    sortBy: (searchParams.get('sortBy') as SearchFilters['sortBy']) || 'rating',
  });

  const fetchHotels = useCallback(async (currentFilters: SearchFilters, pageNum: number, append = false) => {
    setLoading(true);
    try {
      const result = await searchHotels(currentFilters, pageNum, 12);
      setHotels(prev => append ? [...prev, ...result.hotels] : result.hotels);
      setTotal(result.total);
      setHasMore(result.hasMore);
      setPage(pageNum);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHotels(filters, 1);
  }, [filters, fetchHotels]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.city) params.set('city', filters.city);
    if (filters.checkIn) params.set('checkIn', filters.checkIn);
    if (filters.checkOut) params.set('checkOut', filters.checkOut);
    if (filters.sortBy && filters.sortBy !== 'rating') params.set('sortBy', filters.sortBy);
    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  const loadMore = () => {
    fetchHotels(filters, page + 1, true);
  };

  const resetFilters = () => {
    setFilters({ city: filters.city, sortBy: 'rating' });
  };

  const cityName = filters.city || 'все города';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar variant="compact" defaultCity={filters.city || ''} />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Отели: {cityName}
          </h1>
          <p className="text-sm text-muted mt-1">
            {loading ? 'Загрузка...' : `${pluralize(total, 'найден', 'найдено', 'найдено')} ${pluralize(total, 'отель', 'отеля', 'отелей')}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SortDropdown
            value={filters.sortBy}
            onChange={(sortBy) => setFilters({ ...filters, sortBy })}
          />
          <button
            onClick={() => setShowMap(!showMap)}
            className={cn(
              'px-3 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer hidden lg:flex items-center gap-1',
              showMap ? 'bg-primary text-white border-primary' : 'border-border text-muted hover:border-primary'
            )}
          >
            Карта
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'px-3 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer lg:hidden flex items-center gap-1',
              showFilters ? 'bg-primary text-white border-primary' : 'border-border text-muted hover:border-primary'
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Фильтры
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-6">
        {/* Filter Sidebar - Desktop */}
        <aside className="hidden lg:block w-72 shrink-0">
          <FilterPanel filters={filters} onChange={setFilters} onReset={resetFilters} />
        </aside>

        {/* Mobile Filters */}
        <AnimatePresence>
          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowFilters(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto"
              >
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-semibold">Фильтры</h3>
                  <button onClick={() => setShowFilters(false)} className="p-1 cursor-pointer">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <FilterPanel filters={filters} onChange={setFilters} onReset={resetFilters} />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="flex-1">
          <div className={cn('grid gap-6', showMap ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3')}>
            {/* Map column */}
            {showMap && (
              <div className="hidden lg:block">
                <MapView
                  hotels={hotels}
                  className="h-[600px] sticky top-20"
                  onCitySelect={(cityId) => setFilters(prev => ({ ...prev, city: cityId }))}
                />
              </div>
            )}

            {/* Hotel cards */}
            <div className={cn(showMap ? 'grid grid-cols-1 sm:grid-cols-2 gap-6' : 'contents')}>
              {loading && hotels.length === 0
                ? Array.from({ length: 6 }).map((_, i) => <HotelCardSkeleton key={i} />)
                : hotels.map((hotel, index) => (
                    <HotelCard key={hotel.id} hotel={hotel} index={index % 12} />
                  ))
              }
            </div>
          </div>

          {/* No results */}
          {!loading && hotels.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg font-medium text-muted mb-2">Ничего не найдено</p>
              <p className="text-sm text-muted mb-4">Попробуйте изменить параметры поиска</p>
              <Button variant="outline" onClick={resetFilters}>Сбросить фильтры</Button>
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="text-center mt-8">
              <Button variant="outline" onClick={loadMore} loading={loading}>
                Показать ещё
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <HotelCardSkeleton key={i} />)}
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
