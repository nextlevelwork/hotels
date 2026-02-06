import Link from 'next/link';
import { Globe, Phone, Mail, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Гостинец</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Бронирование отелей по России с видеоверификацией, реальными замерами и ценами без сюрпризов.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                <MessageCircle className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                <Phone className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-3">Направления</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/search?city=moskva" className="hover:text-white transition-colors">Москва</Link></li>
              <li><Link href="/search?city=sankt-peterburg" className="hover:text-white transition-colors">Санкт-Петербург</Link></li>
              <li><Link href="/search?city=sochi" className="hover:text-white transition-colors">Сочи</Link></li>
              <li><Link href="/search?city=kazan" className="hover:text-white transition-colors">Казань</Link></li>
              <li><Link href="/search?city=kaliningrad" className="hover:text-white transition-colors">Калининград</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Подборки</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/search" className="hover:text-white transition-colors">Романтический уикенд</Link></li>
              <li><Link href="/search" className="hover:text-white transition-colors">С детьми на каникулы</Link></li>
              <li><Link href="/search" className="hover:text-white transition-colors">Для цифровых кочевников</Link></li>
              <li><Link href="/search" className="hover:text-white transition-colors">Бюджетно и стильно</Link></li>
              <li><Link href="/search" className="hover:text-white transition-colors">Роскошь 5 звёзд</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">О сервисе</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Как это работает</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Видеоверификация</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Гарантия заселения</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Помощь</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Контакты</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; 2025 Гостинец. Все права защищены. Демо-проект.
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-300 transition-colors">Политика конфиденциальности</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Условия использования</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
