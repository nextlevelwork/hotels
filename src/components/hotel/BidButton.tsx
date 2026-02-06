'use client';

import { useState } from 'react';
import { Handshake, Check, X } from 'lucide-react';
import { formatPriceShort } from '@/lib/utils';
import { submitBid } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface BidButtonProps {
  hotelId: string;
  hotelName: string;
  priceFrom: number;
}

export default function BidButton({ hotelId, hotelName, priceFrom }: BidButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [price, setPrice] = useState(Math.round(priceFrom * 0.85));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ accepted: boolean; message: string } | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await submitBid({
        hotelId,
        roomId: '',
        proposedPrice: price,
        checkIn: '',
        checkOut: '',
        guests: 2,
      });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => { setIsOpen(true); setResult(null); }}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-secondary text-secondary font-semibold hover:bg-secondary hover:text-white transition-colors cursor-pointer"
      >
        <Handshake className="h-4 w-4" />
        Предложить свою цену
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Торг" size="sm">
        {result ? (
          <div className="text-center py-4">
            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${result.accepted ? 'bg-success/10' : 'bg-danger/10'}`}>
              {result.accepted ? <Check className="h-8 w-8 text-success" /> : <X className="h-8 w-8 text-danger" />}
            </div>
            <p className="font-semibold mb-2">{result.accepted ? 'Принято!' : 'Не принято'}</p>
            <p className="text-sm text-muted">{result.message}</p>
            <Button className="mt-4" onClick={() => setIsOpen(false)} fullWidth>
              {result.accepted ? 'Перейти к бронированию' : 'Закрыть'}
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted mb-4">
              Текущая цена: <strong>{formatPriceShort(priceFrom)}</strong> за ночь.
              Предложите свою цену для <strong>{hotelName}</strong>.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Ваша цена за ночь</label>
              <div className="relative">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-border rounded-lg text-lg font-bold outline-none focus:border-primary"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">₽</span>
              </div>
              <input
                type="range"
                min={Math.round(priceFrom * 0.5)}
                max={priceFrom}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full mt-2 accent-secondary"
              />
              <div className="flex justify-between text-xs text-muted mt-1">
                <span>{formatPriceShort(Math.round(priceFrom * 0.5))}</span>
                <span>{formatPriceShort(priceFrom)}</span>
              </div>
              {price < priceFrom && (
                <p className="text-sm text-success mt-2">
                  Скидка: {Math.round(((priceFrom - price) / priceFrom) * 100)}% ({formatPriceShort(priceFrom - price)})
                </p>
              )}
            </div>
            <Button onClick={handleSubmit} loading={loading} fullWidth variant="secondary">
              <Handshake className="h-4 w-4 mr-2" />
              Отправить предложение
            </Button>
          </>
        )}
      </Modal>
    </>
  );
}
