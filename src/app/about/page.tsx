import type { Metadata } from 'next';
import { Video, ShieldCheck, Ruler, Wifi, Volume2, BadgeCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'О сервисе',
  description: 'Гостинец — сервис бронирования отелей с видеоверификацией, реальными замерами и ценами без сюрпризов.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">О сервисе Гостинец</h1>

      <p className="text-muted leading-relaxed mb-8">
        Гостинец — это платформа бронирования отелей по России, которая ставит прозрачность на первое место.
        Мы лично проверяем каждый отель, проводим реальные замеры и публикуем видеотуры, чтобы вы точно знали,
        что вас ждёт при заселении.
      </p>

      <section className="space-y-12">
        {/* Как это работает */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Как это работает</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-border p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">1. Видеотур</h3>
              <p className="text-sm text-muted">
                Смотрите реальное видео номеров и территории, снятое нашей командой
              </p>
            </div>
            <div className="bg-white rounded-xl border border-border p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Ruler className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">2. Замеры</h3>
              <p className="text-sm text-muted">
                Независимые замеры шума, скорости Wi-Fi и площади номеров
              </p>
            </div>
            <div className="bg-white rounded-xl border border-border p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">3. Бронирование</h3>
              <p className="text-sm text-muted">
                Бронируйте с уверенностью — цена фиксирована, без скрытых доплат
              </p>
            </div>
          </div>
        </div>

        {/* Видеоверификация */}
        <div id="verification">
          <h2 className="text-2xl font-bold mb-4">Видеоверификация</h2>
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-muted leading-relaxed mb-3">
                  Каждый отель в каталоге Гостинец проходит независимую видеоверификацию.
                  Наша команда посещает объект, снимает видеотур по номерам, лобби, ресторанам и территории.
                </p>
                <p className="text-muted leading-relaxed mb-3">
                  Мы проводим инструментальные замеры уровня шума (в децибелах) и скорости интернета (Мбит/с)
                  в разное время суток.
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted">
                    <Volume2 className="h-4 w-4 text-green-500" />
                    Замер шума
                  </div>
                  <div className="flex items-center gap-2 text-muted">
                    <Wifi className="h-4 w-4 text-blue-500" />
                    Замер Wi-Fi
                  </div>
                  <div className="flex items-center gap-2 text-muted">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    Фото без фильтров
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Гарантия */}
        <div id="guarantee">
          <h2 className="text-2xl font-bold mb-4">Гарантия заселения</h2>
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                <ShieldCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-muted leading-relaxed mb-3">
                  Отели с бейджем «Гарантия заселения» проходят расширенную проверку.
                  Если при заселении условия существенно отличаются от описания на сайте,
                  мы поможем найти альтернативу или вернём деньги.
                </p>
                <ul className="space-y-2 text-sm text-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Номер соответствует фотографиям и описанию
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Заявленные удобства доступны
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    Цена без скрытых доплат
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
