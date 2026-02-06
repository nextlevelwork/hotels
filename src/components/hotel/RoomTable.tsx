'use client';

import Link from 'next/link';
import { Users, Maximize2, BedDouble, Coffee, XCircle, Check } from 'lucide-react';
import { cn, formatPriceShort } from '@/lib/utils';
import type { RoomType } from '@/data/types';

interface RoomTableProps {
  rooms: RoomType[];
  hotelSlug: string;
  hotelName: string;
}

export default function RoomTable({ rooms, hotelSlug, hotelName }: RoomTableProps) {
  if (rooms.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border p-8 text-center">
        <p className="text-muted">Нет доступных номеров на выбранные даты</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rooms.map((room) => (
        <div
          key={room.id}
          className="bg-white rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-colors"
        >
          <div className="flex flex-col sm:flex-row">
            {/* Image placeholder */}
            <div className="sm:w-48 h-32 sm:h-auto bg-gradient-to-br from-primary/15 to-primary/25 shrink-0" />

            {/* Info */}
            <div className="flex-1 p-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{room.name}</h3>
                  <p className="text-sm text-muted mb-3">{room.description}</p>

                  <div className="flex flex-wrap gap-3 text-xs text-muted mb-3">
                    <span className="flex items-center gap-1">
                      <Maximize2 className="h-3.5 w-3.5" />
                      {room.area} м²
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      до {room.maxGuests} гостей
                    </span>
                    <span className="flex items-center gap-1">
                      <BedDouble className="h-3.5 w-3.5" />
                      {room.bedType}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {room.breakfastIncluded && (
                      <span className="flex items-center gap-1 text-success">
                        <Coffee className="h-3.5 w-3.5" />
                        Завтрак включён
                      </span>
                    )}
                    {room.cancellationFree && (
                      <span className="flex items-center gap-1 text-success">
                        <Check className="h-3.5 w-3.5" />
                        Бесплатная отмена
                      </span>
                    )}
                    {!room.available && (
                      <span className="flex items-center gap-1 text-danger">
                        <XCircle className="h-3.5 w-3.5" />
                        Нет мест
                      </span>
                    )}
                  </div>
                </div>

                {/* Price & Book */}
                <div className="text-right sm:min-w-[160px]">
                  {room.originalPrice && (
                    <div className="text-sm text-muted line-through">
                      {formatPriceShort(room.originalPrice)}
                    </div>
                  )}
                  <div className="text-xl font-bold text-foreground mb-1">
                    {formatPriceShort(room.pricePerNight)}
                  </div>
                  <div className="text-xs text-muted mb-3">за ночь</div>

                  {room.available ? (
                    <Link
                      href={`/booking/${hotelSlug}?room=${room.id}`}
                      className="inline-block bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors"
                    >
                      Выбрать
                    </Link>
                  ) : (
                    <button disabled className="bg-gray-100 text-gray-400 px-5 py-2 rounded-lg text-sm font-semibold cursor-not-allowed">
                      Нет мест
                    </button>
                  )}

                  {room.available && room.availableCount <= 3 && (
                    <p className="text-xs text-danger mt-2">
                      Осталось {room.availableCount}!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
