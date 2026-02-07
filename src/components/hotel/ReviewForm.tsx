'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { useToastStore } from '@/store/toast-store';

interface ReviewFormProps {
  hotelSlug: string;
  onSuccess: () => void;
}

const travelerOptions = [
  { value: 'business', label: 'Деловая поездка' },
  { value: 'couple', label: 'Пара' },
  { value: 'family', label: 'Семья' },
  { value: 'solo', label: 'Один' },
  { value: 'friends', label: 'С друзьями' },
];

function getRatingColor(value: number, selected: number): string {
  if (value > selected) return 'bg-gray-100 text-gray-400 hover:bg-gray-200';
  if (selected >= 9) return 'bg-primary text-white';
  if (selected >= 7) return 'bg-success text-white';
  if (selected >= 5) return 'bg-warning text-white';
  return 'bg-danger text-white';
}

export default function ReviewForm({ hotelSlug, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [travelerType, setTravelerType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const addToast = useToastStore((s) => s.add);

  const isValid = rating >= 1 && title.trim().length >= 3 && text.trim().length >= 10 && travelerType;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelSlug, rating, title, text, pros, cons, travelerType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка при отправке отзыва');
        return;
      }

      addToast('success', 'Отзыв успешно отправлен!');
      onSuccess();
    } catch {
      setError('Ошибка сети. Попробуйте позже.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Rating picker */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Оценка <span className="text-danger">*</span>
        </label>
        <div className="flex gap-1.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={cn(
                'w-9 h-9 rounded-lg text-sm font-bold transition-all cursor-pointer',
                rating === 0
                  ? 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  : getRatingColor(value, rating)
              )}
            >
              {value}
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-xs text-muted mt-1">
            {rating >= 9 ? 'Превосходно' : rating >= 7 ? 'Хорошо' : rating >= 5 ? 'Нормально' : 'Плохо'}
          </p>
        )}
      </div>

      {/* Traveler type */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Тип поездки <span className="text-danger">*</span>
        </label>
        <select
          value={travelerType}
          onChange={(e) => setTravelerType(e.target.value)}
          className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Выберите тип</option>
          {travelerOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Заголовок <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Кратко о вашем впечатлении"
          maxLength={100}
          className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {title.length > 0 && title.trim().length < 3 && (
          <p className="text-xs text-danger mt-1">Минимум 3 символа</p>
        )}
      </div>

      {/* Text */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Отзыв <span className="text-danger">*</span>
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Расскажите подробнее о вашем пребывании..."
          rows={4}
          maxLength={2000}
          className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
        {text.length > 0 && text.trim().length < 10 && (
          <p className="text-xs text-danger mt-1">Минимум 10 символов</p>
        )}
      </div>

      {/* Pros & Cons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-success mb-2">+ Плюсы</label>
          <input
            type="text"
            value={pros}
            onChange={(e) => setPros(e.target.value)}
            placeholder="Что понравилось"
            maxLength={200}
            className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-danger mb-2">- Минусы</label>
          <input
            type="text"
            value={cons}
            onChange={(e) => setCons(e.target.value)}
            placeholder="Что не понравилось"
            maxLength={200}
            className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <Button type="submit" disabled={!isValid} loading={submitting} fullWidth>
        <Send className="h-4 w-4 mr-2" />
        Отправить отзыв
      </Button>
    </form>
  );
}
