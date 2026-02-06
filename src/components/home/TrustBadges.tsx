import { Shield, Clock, CreditCard, HeadphonesIcon } from 'lucide-react';

const badges = [
  { icon: Shield, title: 'Гарантия заселения', desc: 'Или мы найдём альтернативу за наш счёт' },
  { icon: Clock, title: 'Бесплатная отмена', desc: 'Большинство отелей — до 24ч до заезда' },
  { icon: CreditCard, title: 'Безопасная оплата', desc: 'Шифрование данных, СБП, карты' },
  { icon: HeadphonesIcon, title: 'Поддержка 24/7', desc: 'Чат, телефон, Telegram' },
];

export default function TrustBadges() {
  return (
    <section className="py-12 bg-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{badge.title}</h3>
                  <p className="text-xs text-muted mt-0.5">{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
