'use client';

import FavoriteButton from '@/components/ui/FavoriteButton';
import ShareButton from '@/components/hotel/ShareButton';

interface HotelSidebarActionsProps {
  slug: string;
  hotelName: string;
}

export default function HotelSidebarActions({ slug, hotelName }: HotelSidebarActionsProps) {
  return (
    <div className="flex gap-2 mt-3">
      <FavoriteButton slug={slug} mode="text" className="flex-1" />
      <ShareButton title={hotelName} className="flex-1" />
    </div>
  );
}
