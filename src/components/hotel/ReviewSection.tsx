'use client';

import { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, Sparkles, User, PenSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelative } from '@/lib/format';
import RatingBadge from '@/components/ui/RatingBadge';
import Modal from '@/components/ui/Modal';
import ReviewForm from '@/components/hotel/ReviewForm';
import type { Review, ReviewSummary } from '@/data/types';

interface ReviewSectionProps {
  reviews: Review[];
  summary: ReviewSummary | null;
  hotelSlug?: string;
  canReview?: boolean;
}

const travelerLabels: Record<string, string> = {
  business: 'Деловая поездка',
  couple: 'Пара',
  family: 'Семья',
  solo: 'Один',
  friends: 'С друзьями',
};

type SortBy = 'date' | 'rating-high' | 'rating-low';

function sortReviews(items: Review[], sortBy: SortBy): Review[] {
  const sorted = [...items];
  switch (sortBy) {
    case 'rating-high':
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case 'rating-low':
      sorted.sort((a, b) => a.rating - b.rating);
      break;
    case 'date':
    default:
      sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      break;
  }
  return sorted;
}

export default function ReviewSection({ reviews: initialReviews, summary, hotelSlug, canReview }: ReviewSectionProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [showForm, setShowForm] = useState(false);

  const filtered = filter === 'all' ? reviews : reviews.filter(r => r.travelerType === filter);
  const sorted = sortReviews(filtered, sortBy);

  const handleReviewSuccess = () => {
    setShowForm(false);
    // Refetch DB reviews and prepend
    if (hotelSlug) {
      fetch(`/api/reviews?hotelSlug=${hotelSlug}`)
        .then((res) => res.json())
        .then((dbReviews: Array<{ id: string; authorName: string; rating: number; createdAt: string; title: string; text: string; pros?: string; cons?: string; travelerType: string }>) => {
          const mapped: Review[] = dbReviews.map((r) => ({
            id: r.id,
            hotelId: hotelSlug,
            authorName: r.authorName,
            rating: r.rating,
            date: r.createdAt,
            title: r.title,
            text: r.text,
            pros: r.pros,
            cons: r.cons,
            travelerType: r.travelerType as Review['travelerType'],
          }));
          // Merge: DB reviews first, then mock reviews (those without DB id pattern)
          const mockReviews = initialReviews.filter(
            (mr) => !mapped.some((db) => db.id === mr.id)
          );
          setReviews([...mapped, ...mockReviews]);
        })
        .catch(() => {});
    }
  };

  // No reviews at all — show a minimal message
  if (reviews.length === 0 && !summary) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Отзывы</h2>
          {canReview && hotelSlug && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
            >
              <PenSquare className="h-4 w-4" />
              Написать отзыв
            </button>
          )}
        </div>
        <div className="bg-white rounded-xl border border-border p-8 text-center">
          <p className="text-muted text-sm">Отзывов пока нет. Станьте первым, кто оставит отзыв об этом отеле!</p>
        </div>

        {hotelSlug && (
          <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Написать отзыв" size="lg">
            <ReviewForm hotelSlug={hotelSlug} onSuccess={handleReviewSuccess} />
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Отзывы</h2>
        {canReview && hotelSlug && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
          >
            <PenSquare className="h-4 w-4" />
            Написать отзыв
          </button>
        )}
      </div>

      {/* AI Summary */}
      {summary && (
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/10 p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">AI-суммаризация отзывов</h3>
              <p className="text-sm text-muted leading-relaxed">{summary.aiSummary}</p>
            </div>
          </div>

          {/* Category bars */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
            {Object.entries(summary.categories).map(([key, value]) => {
              const labels: Record<string, string> = {
                cleanliness: 'Чистота',
                comfort: 'Комфорт',
                location: 'Расположение',
                service: 'Сервис',
                value: 'Цена/качество',
              };
              return (
                <div key={key} className="text-center">
                  <div className="text-lg font-bold text-foreground">{value.toFixed(1)}</div>
                  <div className="text-xs text-muted">{labels[key]}</div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-primary h-1.5 rounded-full"
                      style={{ width: `${(value / 10) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top pros/cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold text-success flex items-center gap-1 mb-2">
                <ThumbsUp className="h-3.5 w-3.5" /> Хвалят
              </h4>
              <ul className="space-y-1">
                {summary.topPros.map(pro => (
                  <li key={pro} className="text-xs text-muted flex items-start gap-1.5">
                    <span className="text-success mt-0.5">+</span> {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-danger flex items-center gap-1 mb-2">
                <ThumbsDown className="h-3.5 w-3.5" /> Критикуют
              </h4>
              <ul className="space-y-1">
                {summary.topCons.map(con => (
                  <li key={con} className="text-xs text-muted flex items-start gap-1.5">
                    <span className="text-danger mt-0.5">−</span> {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Sort controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
        {['all', 'business', 'couple', 'family', 'solo', 'friends'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer',
              filter === type
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-muted hover:bg-gray-200'
            )}
          >
            {type === 'all' ? 'Все' : travelerLabels[type]}
          </button>
        ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted">{sorted.length} шт.</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="text-sm border border-border rounded-lg px-2 py-1.5 bg-white text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="date">По дате</option>
            <option value="rating-high">Высокий рейтинг</option>
            <option value="rating-low">Низкий рейтинг</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sorted.map(review => (
          <div key={review.id} className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">{review.authorName}</div>
                  <div className="text-xs text-muted">{travelerLabels[review.travelerType]} &middot; {formatRelative(review.date)}</div>
                </div>
              </div>
              <RatingBadge rating={review.rating} size="sm" />
            </div>
            <h4 className="font-semibold mb-1">{review.title}</h4>
            <p className="text-sm text-muted leading-relaxed mb-3">{review.text}</p>
            {(review.pros || review.cons) && (
              <div className="flex flex-col sm:flex-row gap-3 text-xs">
                {review.pros && (
                  <div className="flex-1 bg-success/5 rounded-lg p-2">
                    <span className="font-semibold text-success">+ </span>
                    <span className="text-muted">{review.pros}</span>
                  </div>
                )}
                {review.cons && (
                  <div className="flex-1 bg-danger/5 rounded-lg p-2">
                    <span className="font-semibold text-danger">− </span>
                    <span className="text-muted">{review.cons}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="text-center text-muted py-8">Нет отзывов для выбранного фильтра</p>
        )}
      </div>

      {hotelSlug && (
        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Написать отзыв" size="lg">
          <ReviewForm hotelSlug={hotelSlug} onSuccess={handleReviewSuccess} />
        </Modal>
      )}
    </div>
  );
}
