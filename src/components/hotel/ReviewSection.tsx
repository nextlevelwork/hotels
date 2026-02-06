'use client';

import { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelative } from '@/lib/format';
import RatingBadge from '@/components/ui/RatingBadge';
import type { Review, ReviewSummary } from '@/data/types';

interface ReviewSectionProps {
  reviews: Review[];
  summary: ReviewSummary | null;
}

const travelerLabels: Record<string, string> = {
  business: 'Деловая поездка',
  couple: 'Пара',
  family: 'Семья',
  solo: 'Один',
  friends: 'С друзьями',
};

export default function ReviewSection({ reviews, summary }: ReviewSectionProps) {
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? reviews : reviews.filter(r => r.travelerType === filter);

  // No reviews at all — show a minimal message
  if (reviews.length === 0 && !summary) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-6">Отзывы</h2>
        <div className="bg-white rounded-xl border border-border p-8 text-center">
          <p className="text-muted text-sm">Отзывов пока нет. Станьте первым, кто оставит отзыв об этом отеле!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Отзывы</h2>

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

      {/* Filter by traveler type */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
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

      {/* Reviews List */}
      <div className="space-y-4">
        {filtered.map(review => (
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
        {filtered.length === 0 && (
          <p className="text-center text-muted py-8">Нет отзывов для выбранного фильтра</p>
        )}
      </div>
    </div>
  );
}
