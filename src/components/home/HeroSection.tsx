import SearchBar from '@/components/search/SearchBar';
import { Video, ShieldCheck, Volume2, Wifi } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary via-primary-dark to-[#1a5570] overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
        {/* Text */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight">
            Отели без сюрпризов
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Видеоверификация, реальные замеры шума и Wi-Fi, честные цены.
            Бронируйте с уверенностью.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {[
              { icon: Video, text: 'Видеоверификация' },
              { icon: ShieldCheck, text: 'Цена без сюрпризов' },
              { icon: Volume2, text: 'Замеры шума' },
              { icon: Wifi, text: 'Замеры Wi-Fi' },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium"
              >
                <Icon className="h-4 w-4" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto">
          <SearchBar />
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 sm:gap-12 mt-10 text-white/70 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">50+</div>
            <div>отелей</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">5</div>
            <div>городов</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">100%</div>
            <div>видеопроверка</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">0 ₽</div>
            <div>скрытых доплат</div>
          </div>
        </div>
      </div>
    </section>
  );
}
