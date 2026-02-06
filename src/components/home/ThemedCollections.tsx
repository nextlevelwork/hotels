import Link from 'next/link';
import { collections } from '@/data/collections';
import { ArrowRight } from 'lucide-react';

export default function ThemedCollections() {
  return (
    <section id="collections" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Тематические подборки
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            Мы собрали лучшие отели для каждого типа путешествия
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/search?collection=${collection.slug}`}
              className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-[16/9] relative overflow-hidden bg-gray-200">
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-white/90 rounded-full text-xs font-semibold text-primary">
                    {collection.tag}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-white/80 text-xs">
                    {collection.hotelIds.length} отелей
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                  {collection.title}
                </h3>
                <p className="text-sm text-muted mb-3">{collection.description}</p>
                <div className="flex items-center gap-1 text-primary text-sm font-medium">
                  Смотреть подборку
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
