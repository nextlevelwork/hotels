import Link from 'next/link';
import Image from 'next/image';
import { cities } from '@/data/cities';
import { MapPin } from 'lucide-react';
import { formatPriceShort } from '@/lib/utils';

export default function PopularDestinations() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Популярные направления
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            Откройте лучшие отели в самых популярных городах России
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {cities.map((city, index) => (
            <Link
              key={city.id}
              href={`/search?city=${city.slug}`}
              className={`group relative overflow-hidden rounded-2xl transition-transform hover:scale-[1.02] ${
                index < 2 ? 'sm:col-span-1 lg:col-span-1' : ''
              }`}
            >
              <div className="aspect-[3/4] relative bg-gray-200">
                <Image
                  src={city.image}
                  alt={city.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg mb-1">{city.name}</h3>
                  <div className="flex items-center gap-1 text-white/80 text-sm mb-2">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{city.hotelsCount} отелей</span>
                  </div>
                  <div className="text-white/90 text-sm font-medium">
                    от {formatPriceShort(city.averagePrice)}/ночь
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
