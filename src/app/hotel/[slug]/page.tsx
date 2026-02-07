import { notFound } from 'next/navigation';
import { getHotel, getHotelRooms, getHotelReviews, getHotelReviewSummary } from '@/lib/api';
import { allHotels } from '@/data/hotels';
import Badge from '@/components/ui/Badge';
import RatingBadge from '@/components/ui/RatingBadge';
import StarRating from '@/components/ui/StarRating';
import { MapPin, Clock, XCircle, ChevronRight } from 'lucide-react';
import { pluralize } from '@/lib/utils';
import VideoTour from '@/components/hotel/VideoTour';
import RealMeasurementsPanel from '@/components/hotel/RealMeasurementsPanel';
import RoomTable from '@/components/hotel/RoomTable';
import ReviewSection from '@/components/hotel/ReviewSection';
import BidButton from '@/components/hotel/BidButton';
import PriceChart from '@/components/hotel/PriceChart';
import StickyBookingBar from '@/components/hotel/StickyBookingBar';
import GuaranteeInfo from '@/components/hotel/GuaranteeInfo';
import HotelSidebarActions from '@/components/hotel/HotelSidebarActions';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Review } from '@/data/types';

export async function generateStaticParams() {
  return allHotels.map((hotel) => ({ slug: hotel.slug }));
}

interface HotelPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: HotelPageProps) {
  const { slug } = await params;
  const hotel = await getHotel(slug);
  if (!hotel) return { title: 'Отель не найден' };
  const title = `${hotel.name} — ${hotel.cityName}`;
  const ogImage = hotel.photos[0]?.url;
  return {
    title,
    description: hotel.shortDescription,
    alternates: {
      canonical: `/hotel/${slug}`,
    },
    openGraph: {
      title,
      description: hotel.shortDescription,
      type: 'website',
      ...(ogImage && {
        images: [{ url: ogImage, width: 800, height: 500, alt: hotel.name }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: hotel.shortDescription,
    },
  };
}

export default async function HotelPage({ params }: HotelPageProps) {
  const { slug } = await params;
  const hotel = await getHotel(slug);
  if (!hotel) notFound();

  const rooms = await getHotelRooms(hotel.id);
  const mockReviews = await getHotelReviews(hotel.id);
  const reviewSummary = await getHotelReviewSummary(hotel.id);

  // Fetch DB reviews for this hotel
  const dbReviews = await prisma.review.findMany({
    where: { hotelSlug: slug, status: 'approved' },
    orderBy: { createdAt: 'desc' },
  });

  // Map DB reviews to Review type
  const dbMapped: Review[] = dbReviews.map((r) => ({
    id: r.id,
    hotelId: hotel.id,
    authorName: r.authorName,
    rating: r.rating,
    date: r.createdAt.toISOString(),
    title: r.title,
    text: r.text,
    pros: r.pros ?? undefined,
    cons: r.cons ?? undefined,
    travelerType: r.travelerType as Review['travelerType'],
  }));

  // Merge: DB reviews first, then mock reviews
  const reviews = [...dbMapped, ...mockReviews];

  // Determine if current user can review
  let canReview = false;
  const session = await auth();
  if (session?.user?.id) {
    const today = new Date().toISOString().split('T')[0];
    const hasCompletedBooking = await prisma.booking.findFirst({
      where: {
        userId: session.user.id,
        hotelSlug: slug,
        status: 'confirmed',
        checkOut: { lt: today },
      },
    });
    const hasExistingReview = await prisma.review.findUnique({
      where: { hotelSlug_userId: { hotelSlug: slug, userId: session.user.id } },
    });
    canReview = !!hasCompletedBooking && !hasExistingReview;
  }

  const isVerified = hotel.isVerified !== false; // mock hotels are always verified

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: hotel.name,
    description: hotel.shortDescription,
    address: {
      '@type': 'PostalAddress',
      streetAddress: hotel.address,
      addressLocality: hotel.cityName,
      addressCountry: 'RU',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: hotel.coordinates.lat,
      longitude: hotel.coordinates.lng,
    },
    ...(hotel.stars && { starRating: { '@type': 'Rating', ratingValue: hotel.stars } }),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: hotel.rating,
      reviewCount: hotel.reviewsCount,
      bestRating: 10,
    },
    priceRange: `от ${hotel.priceFrom} ₽`,
    image: hotel.photos[0]?.url,
    checkinTime: hotel.checkIn,
    checkoutTime: hotel.checkOut,
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <nav className="flex items-center gap-2 text-sm text-muted">
          <Link href="/" className="hover:text-primary transition-colors">Главная</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/search?city=${hotel.cityId}`} className="hover:text-primary transition-colors">{hotel.cityName}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium truncate">{hotel.name}</span>
        </nav>
      </div>

      {/* Video Tour / Photo Gallery */}
      <VideoTour hotel={hotel} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {hotel.stars && <StarRating rating={hotel.stars} size="md" />}
                <span className="text-sm text-muted capitalize">{hotel.type}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{hotel.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {hotel.address}
                </div>
                {hotel.reviewsCount > 0 && (
                  <div className="flex items-center gap-2">
                    <RatingBadge rating={hotel.rating} size="sm" />
                    <span>{pluralize(hotel.reviewsCount, 'отзыв', 'отзыва', 'отзывов')}</span>
                  </div>
                )}
              </div>
              {hotel.badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {hotel.badges.map((badge) => (
                    <Badge key={badge.type} badge={badge} size="md" />
                  ))}
                </div>
              )}
              <p className="text-muted leading-relaxed">{hotel.description}</p>
            </div>

            {/* Real Measurements */}
            <RealMeasurementsPanel measurements={hotel.measurements} isVerified={isVerified} />

            {/* Rooms */}
            {rooms.length > 0 && (
              <div id="rooms">
                <h2 className="text-xl font-bold mb-4">Доступные номера</h2>
                <RoomTable rooms={rooms} hotelSlug={hotel.slug} hotelName={hotel.name} />
              </div>
            )}

            {/* Price Chart */}
            {hotel.priceFrom > 0 && (
              <PriceChart hotelId={hotel.id} currentPrice={hotel.priceFrom} />
            )}

            {/* Reviews */}
            <div id="reviews">
              <ReviewSection reviews={reviews} summary={reviewSummary} hotelSlug={slug} canReview={canReview} />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-xl border border-border p-6 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  {hotel.priceFrom > 0 ? (
                    <>
                      <span className="text-sm text-muted">от</span>
                      <div className="text-2xl font-bold text-foreground">
                        {hotel.priceFrom.toLocaleString('ru-RU')} ₽
                        <span className="text-sm font-normal text-muted"> / ночь</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-lg font-semibold text-muted">Цена по запросу</div>
                  )}
                </div>
                {hotel.rating > 0 && <RatingBadge rating={hotel.rating} size="md" />}
              </div>

              <div className="space-y-3 mb-4 text-sm text-muted">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Заезд с {hotel.checkIn}, выезд до {hotel.checkOut}
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  {hotel.cancellationPolicy || 'Уточняйте при бронировании'}
                </div>
              </div>

              <Link
                href={`/booking/${hotel.slug}`}
                className="block w-full bg-primary text-white text-center py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
              >
                Забронировать
              </Link>

              <HotelSidebarActions slug={hotel.slug} hotelName={hotel.name} />

              {hotel.bidEnabled && (
                <div className="mt-3">
                  <BidButton hotelId={hotel.id} hotelName={hotel.name} priceFrom={hotel.priceFrom} />
                </div>
              )}
            </div>

            {hotel.badges.some(b => b.type === 'guarantee') && <GuaranteeInfo />}

            {/* Amenities */}
            {hotel.amenities.length > 0 && (
              <div className="bg-white rounded-xl border border-border p-6">
                <h3 className="font-semibold mb-3">Удобства</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted">
                  {hotel.amenities.slice(0, 12).map((amenity) => (
                    <div key={amenity} className="flex items-center gap-1.5 py-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                      {amenity}
                    </div>
                  ))}
                </div>
                {hotel.amenities.length > 12 && (
                  <p className="text-xs text-primary mt-2">+ ещё {hotel.amenities.length - 12}</p>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Sticky Booking Bar (Mobile) */}
      <StickyBookingBar hotel={hotel} />
    </div>
  );
}
