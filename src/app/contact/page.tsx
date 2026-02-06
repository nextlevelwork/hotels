'use client';

import { useState } from 'react';
import { Phone, Mail, MessageCircle, MapPin, Send } from 'lucide-react';
import { useToastStore } from '@/store/toast-store';

export default function ContactPage() {
  const addToast = useToastStore((s) => s.add);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      addToast('success', 'Сообщение отправлено! Мы ответим в ближайшее время.');
      (e.target as HTMLFormElement).reset();
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Контакты</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Контактная информация */}
        <div className="space-y-6">
          <p className="text-muted leading-relaxed">
            Мы всегда на связи. Выберите удобный способ связи или отправьте сообщение через форму.
          </p>

          <div className="space-y-4">
            <a
              href="tel:+78001234567"
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-border hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium text-sm">Телефон</div>
                <div className="text-muted text-sm">8 (800) 123-45-67</div>
              </div>
            </a>

            <a
              href="mailto:info@gostinets.ru"
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-border hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium text-sm">Email</div>
                <div className="text-muted text-sm">info@gostinets.ru</div>
              </div>
            </a>

            <a
              href="https://t.me/gostinets"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-border hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium text-sm">Telegram</div>
                <div className="text-muted text-sm">@gostinets</div>
              </div>
            </a>

            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-border">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium text-sm">Адрес</div>
                <div className="text-muted text-sm">Москва, Россия</div>
              </div>
            </div>
          </div>
        </div>

        {/* Форма обратной связи */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Написать нам</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium mb-1">
                Имя
              </label>
              <input
                id="contact-name"
                type="text"
                required
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Ваше имя"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                required
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium mb-1">
                Сообщение
              </label>
              <textarea
                id="contact-message"
                required
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                placeholder="Ваше сообщение..."
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              {sending ? 'Отправка...' : 'Отправить'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
