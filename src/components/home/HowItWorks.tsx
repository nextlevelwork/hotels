import { Video, BarChart3, ShieldCheck, Handshake } from 'lucide-react';

const steps = [
  {
    icon: Video,
    title: 'Видеоверификация',
    description: 'Каждый отель проверен нашей командой. Видеообзор номеров — без фотошопа и обмана.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: BarChart3,
    title: 'Реальные замеры',
    description: 'Мы измеряем уровень шума (dB), скорость Wi-Fi (Мбит/с) и оцениваем рабочие места.',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    icon: ShieldCheck,
    title: 'Цена без сюрпризов',
    description: 'Финальная цена = цена при бронировании. Никаких скрытых сборов, налогов и доплат.',
    color: 'bg-success/10 text-success',
  },
  {
    icon: Handshake,
    title: 'Торг уместен',
    description: 'Предложите свою цену — многие отели готовы дать скидку, особенно на длительное проживание.',
    color: 'bg-warning/10 text-warning',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Почему Гостинец?
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            Мы создали сервис, которому можно доверять
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="text-center">
                <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
