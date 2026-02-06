import { ShieldCheck, Phone, RefreshCw, CheckCircle } from 'lucide-react';

export default function GuaranteeInfo() {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="h-5 w-5 text-emerald-600" />
        <h3 className="font-semibold text-emerald-900">Гарантия заселения</h3>
      </div>
      <p className="text-sm text-emerald-800 mb-4">
        Если при заезде возникнет проблема — мы решим её за свой счёт:
      </p>
      <div className="space-y-2.5">
        {[
          { icon: RefreshCw, text: 'Подберём альтернативный отель того же класса или выше' },
          { icon: Phone, text: 'Поддержка 24/7 на русском языке' },
          { icon: CheckCircle, text: 'Компенсация разницы в цене за наш счёт' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-2">
            <Icon className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
            <span className="text-sm text-emerald-800">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
