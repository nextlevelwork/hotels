import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности',
  description: 'Политика конфиденциальности сервиса Гостинец.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Политика конфиденциальности</h1>

      <div className="prose prose-gray max-w-none space-y-6 text-muted leading-relaxed text-sm">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">1. Общие положения</h2>
          <p>
            Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных
            пользователей сервиса Гостинец (далее — «Сервис»). Используя Сервис, вы соглашаетесь с условиями
            настоящей Политики.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">2. Какие данные мы собираем</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Имя и фамилия — для оформления бронирования</li>
            <li>Электронная почта — для отправки подтверждений и связи</li>
            <li>Номер телефона — для связи по вопросам бронирования</li>
            <li>Данные об использовании сайта — для улучшения качества сервиса</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">3. Цели обработки данных</h2>
          <p>Персональные данные обрабатываются для:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Оформления и подтверждения бронирований</li>
            <li>Связи с пользователем по вопросам бронирования</li>
            <li>Улучшения работы сервиса</li>
            <li>Отправки уведомлений (с согласия пользователя)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">4. Хранение данных</h2>
          <p>
            Персональные данные хранятся на защищённых серверах на территории Российской Федерации.
            Мы применяем технические и организационные меры для защиты данных от несанкционированного доступа.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">5. Передача данных третьим лицам</h2>
          <p>
            Мы передаём данные только отелям для оформления бронирования и платёжным системам для
            обработки оплаты. Мы не продаём и не передаём данные третьим лицам для маркетинговых целей.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">6. Права пользователя</h2>
          <p>Вы имеете право:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Запросить информацию о хранимых данных</li>
            <li>Потребовать исправления или удаления данных</li>
            <li>Отозвать согласие на обработку данных</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">7. Файлы cookie</h2>
          <p>
            Сервис использует файлы cookie для обеспечения работы функции «Избранное» и улучшения
            пользовательского опыта. Вы можете отключить cookie в настройках браузера.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">8. Контакты</h2>
          <p>
            По вопросам, связанным с обработкой персональных данных, обращайтесь: privacy@gostinets.ru
          </p>
        </section>

        <p className="text-xs text-gray-400 pt-4">
          Дата последнего обновления: 1 января 2026 г. Это демо-проект.
        </p>
      </div>
    </div>
  );
}
