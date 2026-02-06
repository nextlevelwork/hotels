'use client';

import { useEffect, useState, Suspense, use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getHotel, getHotelByHid, getHotelRooms, createBooking, createOstrovokBooking, validatePromoCode } from '@/lib/api';
import { useBookingStore } from '@/store/booking-store';
import { formatPriceShort, pluralize } from '@/lib/utils';
import { nightsCount } from '@/lib/format';
import Stepper from '@/components/ui/Stepper';
import Button from '@/components/ui/Button';
import type { Hotel, RoomType } from '@/data/types';
import {
  BedDouble, Users, Calendar, CreditCard, Smartphone, Banknote,
  ShieldCheck, Tag, ChevronLeft, Check, Gift
} from 'lucide-react';

const steps = [
  { id: 1, label: 'Номер' },
  { id: 2, label: 'Данные' },
  { id: 3, label: 'Оплата' },
  { id: 4, label: 'Готово' },
];

function BookingContent({ hotelSlug }: { hotelSlug: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const store = useBookingStore();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingProgress, setBookingProgress] = useState<string>('');
  const [promoInput, setPromoInput] = useState('');
  const [promoStatus, setPromoStatus] = useState<string>('');

  // Guest form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      const h = await getHotel(hotelSlug);
      if (!h) { router.push('/'); return; }
      setHotel(h);
      const r = await getHotelRooms(h.id);
      setRooms(r);

      // Detect Ostrovok hotel
      if (h.ostrovokHid) {
        store.setOstrovok({ ostrovokHid: h.ostrovokHid, bookHash: h.bookHash });
      }

      const roomParam = searchParams.get('room');
      const preselected = roomParam ? r.find(rm => rm.id === roomParam) : r[0];
      if (preselected) {
        store.setRoom({
          hotelSlug: h.slug,
          hotelName: h.name,
          roomId: preselected.id,
          roomName: preselected.name,
          pricePerNight: preselected.pricePerNight,
          bookHash: preselected.bookHash,
        });
      }

      // Default dates
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);
      store.setDates(
        tomorrow.toISOString().split('T')[0],
        dayAfter.toISOString().split('T')[0]
      );

      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelSlug]);

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = 'Введите имя';
    if (!lastName.trim()) errors.lastName = 'Введите фамилию';
    if (!email.trim() || !email.includes('@')) errors.email = 'Введите корректный email';
    if (!phone.trim() || phone.length < 10) errors.phone = 'Введите корректный телефон';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    const result = await validatePromoCode(promoInput);
    if (result.valid) {
      store.setPromoCode(promoInput, result.discount);
      setPromoStatus(`${result.description}`);
    } else {
      setPromoStatus(result.description);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setBookingProgress('');
    try {
      let booking;

      if (store.isOstrovok && store.bookHash) {
        // Ostrovok booking flow
        booking = await createOstrovokBooking({
          bookHash: store.bookHash,
          hotelName: store.hotelName,
          hotelSlug: store.hotelSlug,
          roomName: store.roomName,
          checkIn: store.checkIn,
          checkOut: store.checkOut,
          guests: store.guests,
          guestInfo: { firstName, lastName, email, phone, specialRequests },
          pricePerNight: store.pricePerNight,
          totalPrice: store.totalPrice,
          onProgress: (status) => setBookingProgress(status),
        });
      } else {
        // Mock booking flow
        booking = await createBooking({
          hotelSlug: store.hotelSlug,
          roomId: store.roomId,
          checkIn: store.checkIn,
          checkOut: store.checkOut,
          guests: store.guests,
          guestInfo: { firstName, lastName, email, phone, specialRequests },
          paymentMethod: store.paymentMethod,
          promoCode: store.promoCode || undefined,
          bonusRubles: store.bonusRubles || undefined,
        });
      }

      store.setLastBooking(booking);
      router.push(`/confirmation/${booking.bookingId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка при бронировании';
      alert(message);
    } finally {
      setSubmitting(false);
      setBookingProgress('');
    }
  };

  if (loading || !hotel) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-muted">Загрузка...</div>;
  }

  const selectedRoom = rooms.find(r => r.id === store.roomId);
  const subtotal = store.pricePerNight * store.nightsCount;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Stepper */}
      <div className="mb-8">
        <Stepper steps={steps} currentStep={store.step} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Room Selection */}
          {store.step === 1 && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-xl font-bold mb-4">Выберите номер</h2>
              <div className="space-y-3">
                {rooms.filter(r => r.available).map(room => (
                  <button
                    key={room.id}
                    onClick={() => store.setRoom({
                      hotelSlug: hotel.slug,
                      hotelName: hotel.name,
                      roomId: room.id,
                      roomName: room.name,
                      pricePerNight: room.pricePerNight,
                      bookHash: room.bookHash,
                    })}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-colors cursor-pointer ${
                      store.roomId === room.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{room.name}</h3>
                        <p className="text-sm text-muted mt-1">{room.description}</p>
                        <div className="flex gap-3 mt-2 text-xs text-muted">
                          <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {room.bedType}</span>
                          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> до {room.maxGuests}</span>
                          <span>{room.area} м²</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {room.originalPrice && (
                          <div className="text-sm text-muted line-through">{formatPriceShort(room.originalPrice)}</div>
                        )}
                        <div className="text-lg font-bold">{formatPriceShort(room.pricePerNight)}</div>
                        <div className="text-xs text-muted">за ночь</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Dates */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Заезд</label>
                  <input
                    type="date"
                    value={store.checkIn}
                    onChange={(e) => store.setDates(e.target.value, store.checkOut)}
                    className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Выезд</label>
                  <input
                    type="date"
                    value={store.checkOut}
                    onChange={(e) => store.setDates(store.checkIn, e.target.value)}
                    className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Гости</label>
                <select
                  value={store.guests}
                  onChange={(e) => store.setGuests(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary cursor-pointer"
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n} {pluralize(n, 'гость', 'гостя', 'гостей')}</option>
                  ))}
                </select>
              </div>

              <Button className="mt-6" fullWidth size="lg" onClick={() => store.nextStep()}>
                Продолжить
              </Button>
            </div>
          )}

          {/* Step 2: Guest Info */}
          {store.step === 2 && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-xl font-bold mb-4">Данные гостя</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="guest-firstName" className="block text-sm font-medium mb-1">Имя *</label>
                  <input
                    id="guest-firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Иван"
                    aria-required="true"
                    aria-invalid={!!formErrors.firstName}
                    aria-describedby={formErrors.firstName ? 'error-firstName' : undefined}
                    className={`w-full px-4 py-2.5 border rounded-lg outline-none focus:border-primary ${formErrors.firstName ? 'border-danger' : 'border-border'}`}
                  />
                  {formErrors.firstName && <p id="error-firstName" className="text-xs text-danger mt-1">{formErrors.firstName}</p>}
                </div>
                <div>
                  <label htmlFor="guest-lastName" className="block text-sm font-medium mb-1">Фамилия *</label>
                  <input
                    id="guest-lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Иванов"
                    aria-required="true"
                    aria-invalid={!!formErrors.lastName}
                    aria-describedby={formErrors.lastName ? 'error-lastName' : undefined}
                    className={`w-full px-4 py-2.5 border rounded-lg outline-none focus:border-primary ${formErrors.lastName ? 'border-danger' : 'border-border'}`}
                  />
                  {formErrors.lastName && <p id="error-lastName" className="text-xs text-danger mt-1">{formErrors.lastName}</p>}
                </div>
                <div>
                  <label htmlFor="guest-email" className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    id="guest-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ivan@mail.ru"
                    aria-required="true"
                    aria-invalid={!!formErrors.email}
                    aria-describedby={formErrors.email ? 'error-email' : undefined}
                    className={`w-full px-4 py-2.5 border rounded-lg outline-none focus:border-primary ${formErrors.email ? 'border-danger' : 'border-border'}`}
                  />
                  {formErrors.email && <p id="error-email" className="text-xs text-danger mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <label htmlFor="guest-phone" className="block text-sm font-medium mb-1">Телефон *</label>
                  <input
                    id="guest-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 999 123-45-67"
                    aria-required="true"
                    aria-invalid={!!formErrors.phone}
                    aria-describedby={formErrors.phone ? 'error-phone' : undefined}
                    className={`w-full px-4 py-2.5 border rounded-lg outline-none focus:border-primary ${formErrors.phone ? 'border-danger' : 'border-border'}`}
                  />
                  {formErrors.phone && <p id="error-phone" className="text-xs text-danger mt-1">{formErrors.phone}</p>}
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="guest-specialRequests" className="block text-sm font-medium mb-1">Особые пожелания</label>
                <textarea
                  id="guest-specialRequests"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Высокий этаж, детская кроватка..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => store.prevStep()}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Назад
                </Button>
                <Button fullWidth size="lg" onClick={() => {
                  if (validateStep2()) {
                    store.setGuestInfo({ firstName, lastName, email, phone, specialRequests });
                    store.nextStep();
                  }
                }}>
                  Продолжить
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {store.step === 3 && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-xl font-bold mb-4">Оплата</h2>

              {/* Payment Method */}
              <div className="space-y-3 mb-6">
                {[
                  { value: 'card' as const, label: 'Банковская карта', icon: CreditCard, desc: 'Visa, MasterCard, Мир' },
                  { value: 'sbp' as const, label: 'СБП', icon: Smartphone, desc: 'Система быстрых платежей' },
                  { value: 'cash' as const, label: 'При заселении', icon: Banknote, desc: 'Наличные или карта' },
                ].map(method => (
                  <button
                    key={method.value}
                    onClick={() => store.setPaymentMethod(method.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors cursor-pointer ${
                      store.paymentMethod === method.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <method.icon className="h-6 w-6 text-muted" />
                    <div className="text-left">
                      <div className="font-medium">{method.label}</div>
                      <div className="text-sm text-muted">{method.desc}</div>
                    </div>
                    {store.paymentMethod === method.value && (
                      <Check className="h-5 w-5 text-primary ml-auto" />
                    )}
                  </button>
                ))}
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                  <Tag className="h-4 w-4" /> Промокод
                </label>
                <div className="flex gap-2">
                  <input
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Введите промокод"
                    className="flex-1 px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary"
                  />
                  <Button variant="outline" onClick={handleApplyPromo}>Применить</Button>
                </div>
                {promoStatus && (
                  <p className={`text-sm mt-1 ${store.promoDiscount > 0 ? 'text-success' : 'text-danger'}`}>
                    {promoStatus}
                  </p>
                )}
              </div>

              {/* Bonus Rubles */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                  <Gift className="h-4 w-4" /> Бонусные рубли
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={Math.min(1000, subtotal)}
                    step={100}
                    value={store.bonusRubles}
                    onChange={(e) => store.setBonusRubles(Number(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-sm font-semibold w-24 text-right">{formatPriceShort(store.bonusRubles)}</span>
                </div>
                <p className="text-xs text-muted mt-1">У вас 1 000 бонусных рублей</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => store.prevStep()}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Назад
                </Button>
                <Button fullWidth size="lg" onClick={handleSubmit} loading={submitting}>
                  {bookingProgress || 'Подтвердить бронирование'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Price Breakdown Sidebar */}
        <aside>
          <div className="bg-white rounded-xl border border-border p-6 sticky top-20">
            <h3 className="font-semibold mb-4">Ваше бронирование</h3>

            <div className="text-sm space-y-3 mb-4">
              <div className="font-medium">{hotel.name}</div>
              {selectedRoom && (
                <div className="text-muted flex items-center gap-1">
                  <BedDouble className="h-4 w-4" /> {selectedRoom.name}
                </div>
              )}
              <div className="text-muted flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {store.checkIn} — {store.checkOut}
              </div>
              <div className="text-muted flex items-center gap-1">
                <Users className="h-4 w-4" />
                {pluralize(store.guests, 'гость', 'гостя', 'гостей')}, {pluralize(store.nightsCount, 'ночь', 'ночи', 'ночей')}
              </div>
            </div>

            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">{formatPriceShort(store.pricePerNight)} &times; {pluralize(store.nightsCount, 'ночь', 'ночи', 'ночей')}</span>
                <span>{formatPriceShort(subtotal)}</span>
              </div>
              {store.promoDiscount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Промокод ({store.promoDiscount}%)</span>
                  <span>−{formatPriceShort(Math.round(subtotal * (store.promoDiscount / 100)))}</span>
                </div>
              )}
              {store.bonusRubles > 0 && (
                <div className="flex justify-between text-success">
                  <span>Бонусные рубли</span>
                  <span>−{formatPriceShort(store.bonusRubles)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-border mt-3 pt-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Итого</span>
                <span className="font-bold text-xl text-primary">{formatPriceShort(store.totalPrice)}</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-success">
                <ShieldCheck className="h-3.5 w-3.5" />
                Без сюрпризов. Финальная цена.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function BookingPage({ params }: { params: Promise<{ hotelSlug: string }> }) {
  const { hotelSlug } = use(params);
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-12 text-center text-muted">Загрузка...</div>}>
      <BookingContent hotelSlug={hotelSlug} />
    </Suspense>
  );
}
