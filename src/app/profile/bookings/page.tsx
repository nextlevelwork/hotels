'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, BedDouble, Search, Check, MessageSquarePlus, Gift } from 'lucide-react';
import Button from '@/components/ui/Button';
import { formatPriceShort, pluralize } from '@/lib/utils';

interface BookingItem {
  id: string;
  bookingId: string;
  hotelSlug: string;
  hotelName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  finalPrice: number;
  bonusSpent: number;
  bonusEarned: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: 'Подтверждено', className: 'bg-success/10 text-success border-success/20' },
  pending: { label: 'Ожидает', className: 'bg-warning/10 text-warning border-warning/20' },
  cancelled: { label: 'Отменено', className: 'bg-danger/10 text-danger border-danger/20' },
};

function isCheckOutPast(checkOut: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return checkOut < today;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewedSlugs, setReviewedSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      fetch('/api/bookings').then((res) => res.json()),
      fetch('/api/reviews/my').then((res) => res.json()).catch(() => []),
    ])
      .then(([bookingsData, slugs]) => {
        if (Array.isArray(bookingsData)) setBookings(bookingsData);
        if (Array.isArray(slugs)) setReviewedSlugs(new Set(slugs));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-muted">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-8">Мои бронирования</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-muted" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Нет бронирований</h2>
          <p className="text-muted mb-6">Забронируйте отель и он появится здесь</p>
          <Link href="/search">
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Найти отель
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const statusInfo = statusConfig[booking.status] || statusConfig.confirmed;
            const canReview = booking.status === 'confirmed' && isCheckOutPast(booking.checkOut);
            const hasReviewed = reviewedSlugs.has(booking.hotelSlug);
            return (
              <div
                key={booking.id}
                className="bg-white rounded-xl border border-border p-5 hover:border-primary/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{booking.hotelName}</h3>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-muted mb-2">
                      <BedDouble className="h-4 w-4" />
                      {booking.roomName}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {booking.checkIn} — {booking.checkOut}
                      </span>
                      <span>
                        {pluralize(booking.nights, 'ночь', 'ночи', 'ночей')}
                      </span>
                    </div>

                    {/* Bonus badges */}
                    {(booking.bonusEarned > 0 || booking.bonusSpent > 0) && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {booking.bonusEarned > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-medium rounded-full">
                            <Gift className="h-3 w-3" /> +{booking.bonusEarned.toLocaleString('ru-RU')} бонусов
                          </span>
                        )}
                        {booking.bonusSpent > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-medium rounded-full">
                            <Gift className="h-3 w-3" /> Списано {booking.bonusSpent.toLocaleString('ru-RU')}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Review actions */}
                    {canReview && (
                      <div className="mt-3">
                        {hasReviewed ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-success/10 text-success text-xs font-medium rounded-full">
                            <Check className="h-3.5 w-3.5" />
                            Отзыв оставлен
                          </span>
                        ) : (
                          <Link
                            href={`/hotel/${booking.hotelSlug}#reviews`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors"
                          >
                            <MessageSquarePlus className="h-3.5 w-3.5" />
                            Оставить отзыв
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {formatPriceShort(booking.finalPrice)}
                    </div>
                    <div className="text-xs text-muted font-mono mt-1">
                      {booking.bookingId}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
