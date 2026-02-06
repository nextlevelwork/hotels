import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Условия использования',
  description: 'Условия использования сервиса бронирования отелей Гостинец.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Условия использования</h1>

      <div className="prose prose-gray max-w-none space-y-6 text-muted leading-relaxed text-sm">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">1. Общие условия</h2>
          <p>
            Настоящие Условия использования регулируют отношения между пользователем и сервисом Гостинец
            (далее — «Сервис»). Используя Сервис, вы принимаете настоящие Условия в полном объёме.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">2. Описание сервиса</h2>
          <p>
            Гостинец предоставляет платформу для поиска и бронирования отелей на территории России.
            Сервис включает функции видеоверификации, реальных замеров, системы торга и AI-суммаризации отзывов.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">3. Бронирование</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Бронирование считается подтверждённым после получения подтверждения на email</li>
            <li>Цены указаны в российских рублях и включают все обязательные сборы</li>
            <li>Условия отмены определяются конкретным отелем и тарифом</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">4. Система торга</h2>
          <p>
            Функция торга позволяет предложить свою цену за номер. Отель вправе принять или отклонить
            предложение. Принятое предложение является обязательством к бронированию по согласованной цене.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">5. Видеоверификация</h2>
          <p>
            Видеоверификация проводится командой Гостинец и отражает состояние отеля на момент проверки.
            Сервис не несёт ответственности за изменения, произошедшие после даты верификации.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">6. Ответственность</h2>
          <p>
            Сервис выступает посредником между пользователем и отелем. Ответственность за качество
            предоставляемых услуг несёт непосредственно отель. Гостинец содействует в разрешении споров
            в рамках программы «Гарантия заселения».
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">7. Интеллектуальная собственность</h2>
          <p>
            Все материалы Сервиса (тексты, фотографии, видео, дизайн) являются интеллектуальной
            собственностью Гостинец и защищены законодательством РФ.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">8. Изменение условий</h2>
          <p>
            Сервис оставляет за собой право вносить изменения в настоящие Условия. Актуальная версия
            всегда доступна на данной странице.
          </p>
        </section>

        <p className="text-xs text-gray-400 pt-4">
          Дата последнего обновления: 1 января 2026 г. Это демо-проект.
        </p>
      </div>
    </div>
  );
}
