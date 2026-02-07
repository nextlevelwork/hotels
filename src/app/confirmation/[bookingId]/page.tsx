'use client';

import { use, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  CheckCircle, Calendar, MapPin, BedDouble, CreditCard,
  Download, Mail, Phone, MessageCircle, Home, ArrowRight
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useBookingStore } from '@/store/booking-store';
import { formatPriceShort, pluralize } from '@/lib/utils';

interface ConfirmationPageProps {
  params: Promise<{ bookingId: string }>;
}

export default function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { bookingId } = use(params);
  const lastBooking = useBookingStore((s) => s.lastBooking);

  // Persist booking to PostgreSQL (fire-and-forget)
  const saved = useRef(false);
  useEffect(() => {
    if (saved.current || !lastBooking) return;
    saved.current = true;

    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: lastBooking.bookingId,
        hotelSlug: lastBooking.hotel.slug,
        hotelName: lastBooking.hotel.name,
        roomName: lastBooking.room.name,
        checkIn: lastBooking.checkIn,
        checkOut: lastBooking.checkOut,
        nights: lastBooking.nights,
        guests: lastBooking.guests,
        pricePerNight: lastBooking.pricePerNight,
        totalPrice: lastBooking.totalPrice,
        discount: lastBooking.discount,
        finalPrice: lastBooking.finalPrice,
        paymentMethod: lastBooking.paymentMethod,
        status: lastBooking.status,
        guestFirstName: lastBooking.guest.firstName,
        guestLastName: lastBooking.guest.lastName,
        guestEmail: lastBooking.guest.email,
        guestPhone: lastBooking.guest.phone,
      }),
    }).catch(() => {});
  }, [lastBooking]);

  const handleDownloadVoucher = () => {
    window.print();
  };

  const handleEmailVoucher = () => {
    const subject = encodeURIComponent(`Ваучер бронирования ${bookingId} — Гостинец`);
    const hotelName = lastBooking?.hotel.name || 'отеля';
    const roomName = lastBooking?.room.name || 'номера';
    const checkIn = lastBooking?.checkIn || '';
    const checkOut = lastBooking?.checkOut || '';
    const price = lastBooking?.finalPrice ? formatPriceShort(lastBooking.finalPrice) : '';

    const body = encodeURIComponent(
      `Бронирование ${bookingId}\n\nОтель: ${hotelName}\nНомер: ${roomName}\nДаты: ${checkIn} — ${checkOut}\nСтоимость: ${price}\n\nСпасибо за бронирование через Гостинец!`
    );
    const email = lastBooking?.guest.email || '';
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const paymentLabel: Record<string, string> = {
    card: 'Банковская карта',
    sbp: 'СБП',
    cash: 'При заселении',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Success Header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Бронирование подтверждено!
        </h1>
        <p className="text-muted">
          Номер бронирования: <span className="font-mono font-bold text-foreground">{bookingId}</span>
        </p>
      </div>

      {/* Booking Details Card */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden mb-8 print:shadow-none">
        <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-80">Электронный ваучер</div>
              <div className="text-xl font-bold mt-1">Гостинец</div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-80">Номер</div>
              <div className="font-mono font-bold">{bookingId}</div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <div className="text-sm text-muted">Отель</div>
                <div className="font-medium">
                  {lastBooking?.hotel.name || 'Данные бронирования будут отправлены на email'}
                </div>
                {lastBooking?.hotel.address && (
                  <div className="text-xs text-muted mt-0.5">{lastBooking.hotel.address}</div>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <div className="text-sm text-muted">Даты</div>
                <div className="font-medium">
                  {lastBooking
                    ? `${lastBooking.checkIn} — ${lastBooking.checkOut} (${pluralize(lastBooking.nights, 'ночь', 'ночи', 'ночей')})`
                    : 'Указаны в подтверждении на email'}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BedDouble className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <div className="text-sm text-muted">Номер</div>
                <div className="font-medium">
                  {lastBooking?.room.name || 'Согласно выбору при бронировании'}
                </div>
                {lastBooking?.guests && (
                  <div className="text-xs text-muted mt-0.5">
                    {pluralize(lastBooking.guests, 'гость', 'гостя', 'гостей')}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <div className="text-sm text-muted">Оплата</div>
                <div className="font-medium">
                  {lastBooking
                    ? `${formatPriceShort(lastBooking.finalPrice)} — ${paymentLabel[lastBooking.paymentMethod] || 'Подтверждена'}`
                    : 'Подтверждена'}
                </div>
                {lastBooking && lastBooking.discount > 0 && (
                  <div className="text-xs text-success mt-0.5">
                    Скидка: {formatPriceShort(lastBooking.discount)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Guest Info */}
          {lastBooking?.guest && (
            <div className="border-t border-border pt-4">
              <div className="text-sm text-muted mb-1">Гость</div>
              <div className="font-medium">
                {lastBooking.guest.firstName} {lastBooking.guest.lastName}
              </div>
              <div className="text-sm text-muted">
                {lastBooking.guest.email} &middot; {lastBooking.guest.phone}
              </div>
            </div>
          )}
        </div>

        {/* Voucher Actions */}
        <div className="border-t border-border p-4 flex flex-wrap gap-3 print:hidden">
          <button
            onClick={handleDownloadVoucher}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Скачать ваучер
          </button>
          <button
            onClick={handleEmailVoucher}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Mail className="h-4 w-4" />
            Отправить на email
          </button>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-8 print:hidden">
        <h2 className="font-semibold text-lg mb-4">Что дальше?</h2>
        <div className="space-y-4">
          {[
            {
              icon: Mail,
              title: 'Проверьте почту',
              desc: 'Мы отправили подтверждение и ваучер на указанный email',
            },
            {
              icon: Phone,
              title: 'Свяжитесь с отелем',
              desc: 'Если есть особые пожелания, позвоните в отель заранее',
            },
            {
              icon: Calendar,
              title: 'Не забудьте про даты',
              desc: 'Заезд и выезд указаны в подтверждении. Добавьте в календарь!',
            },
            {
              icon: MessageCircle,
              title: 'Нужна помощь?',
              desc: 'Служба поддержки Гостинец доступна 24/7 в чате и по телефону',
            },
          ].map(step => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{step.title}</h3>
                  <p className="text-sm text-muted">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 print:hidden">
        <Link href="/" className="flex-1">
          <Button variant="outline" fullWidth>
            <Home className="h-4 w-4 mr-2" />
            На главную
          </Button>
        </Link>
        <Link href="/search" className="flex-1">
          <Button fullWidth>
            Забронировать ещё
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
