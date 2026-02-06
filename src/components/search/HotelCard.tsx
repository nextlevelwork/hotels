'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Volume2, Wifi, Monitor, Video } from 'lucide-react';
import { cn, formatPriceShort } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import RatingBadge from '@/components/ui/RatingBadge';
import StarRating from '@/components/ui/StarRating';
import type { Hotel } from '@/data/types';

interface HotelCardProps {
  hotel: Hotel;
  index?: number;
  className?: string;
}

export default function HotelCard({ hotel, index = 0, className }: HotelCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
    >
      <Link
        href={`/hotel/${hotel.slug}`}
        className={cn(
          'group block bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300',
          className
        )}
      >
        {/* Image */}
        <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
          <Image
            src={hotel.photos[0]?.url || ''}
            alt={hotel.photos[0]?.alt || hotel.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {hotel.hasVideoVerification && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm">
              <Video className="h-3 w-3" />
              Видео
            </div>
          )}
          {hotel.bidEnabled && (
            <div className="absolute top-3 right-3 bg-secondary text-white px-2 py-1 rounded-lg text-xs font-semibold">
              Торг
            </div>
          )}
          {/* Price overlay */}
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm">
            <div className="text-xs text-muted">от</div>
            <div className="text-lg font-bold text-foreground leading-tight">
              {formatPriceShort(hotel.priceFrom)}
            </div>
            <div className="text-xs text-muted">за ночь</div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {hotel.stars && <StarRating rating={hotel.stars} size="sm" />}
                <span className="text-xs text-muted capitalize">{hotel.type === 'hotel' ? '' : hotel.type}</span>
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {hotel.name}
              </h3>
            </div>
            <RatingBadge rating={hotel.rating} size="sm" />
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-muted mb-3">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{hotel.cityName} &middot; {hotel.address.split(',')[0]}</span>
          </div>

          {/* Measurements */}
          <div className="flex items-center gap-3 mb-3 text-xs">
            <div className="flex items-center gap-1">
              <Volume2 className={cn('h-3.5 w-3.5', hotel.measurements.noise.rating === 'тихо' ? 'text-success' : hotel.measurements.noise.rating === 'умеренно' ? 'text-warning' : 'text-danger')} />
              <span className="text-muted">{hotel.measurements.noise.level} дБ</span>
            </div>
            <div className="flex items-center gap-1">
              <Wifi className={cn('h-3.5 w-3.5', hotel.measurements.wifi.rating === 'отлично' ? 'text-success' : hotel.measurements.wifi.rating === 'хорошо' ? 'text-primary' : 'text-warning')} />
              <span className="text-muted">{hotel.measurements.wifi.speed} Мбит/с</span>
            </div>
            {hotel.measurements.hasWorkspace && (
              <div className="flex items-center gap-1">
                <Monitor className="h-3.5 w-3.5 text-indigo-500" />
                <span className="text-muted">Workspace</span>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            {hotel.badges.slice(0, 3).map((badge) => (
              <Badge key={badge.type} badge={badge} size="sm" />
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
