import Link from 'next/link';
import { formatPriceShort } from '@/lib/utils';
import type { Hotel } from '@/data/types';

interface StickyBookingBarProps {
  hotel: Hotel;
}

export default function StickyBookingBar({ hotel }: StickyBookingBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-3 flex items-center justify-between z-30 lg:hidden shadow-lg">
      <div>
        <span className="text-xs text-muted">от</span>
        <div className="text-lg font-bold">{formatPriceShort(hotel.priceFrom)} <span className="text-xs font-normal text-muted">/ ночь</span></div>
      </div>
      <Link
        href={`/booking/${hotel.slug}`}
        className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
      >
        Забронировать
      </Link>
    </div>
  );
}
