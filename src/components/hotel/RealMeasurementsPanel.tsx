import { Volume2, Wifi, Monitor, Calendar, ShieldQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RealMeasurements } from '@/data/types';
import { formatDate } from '@/lib/format';

interface Props {
  measurements: RealMeasurements;
  isVerified?: boolean;
}

export default function RealMeasurementsPanel({ measurements, isVerified = true }: Props) {
  // Show "not verified" state when measurements haven't been conducted
  if (!isVerified || !measurements.lastVerified) {
    return (
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Реальные замеры</h2>
        </div>
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <ShieldQuestion className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">Замеры не проводились</p>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Этот отель ещё не прошёл верификацию Гостинца. Данные о шуме, Wi-Fi и рабочем месте пока недоступны.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold">Реальные замеры</h2>
        <div className="flex items-center gap-1 text-xs text-muted">
          <Calendar className="h-3.5 w-3.5" />
          Проверено {formatDate(measurements.lastVerified)}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Noise */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              measurements.noise.rating === 'тихо' ? 'bg-success/10 text-success' :
              measurements.noise.rating === 'умеренно' ? 'bg-warning/10 text-warning' :
              'bg-danger/10 text-danger'
            )}>
              <Volume2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-medium">Шум</div>
              <div className={cn(
                'text-xs font-semibold',
                measurements.noise.rating === 'тихо' ? 'text-success' :
                measurements.noise.rating === 'умеренно' ? 'text-warning' : 'text-danger'
              )}>
                {measurements.noise.rating}
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">{measurements.noise.level} <span className="text-sm font-normal text-muted">дБ</span></div>
          <p className="text-xs text-muted">{measurements.noise.details}</p>
        </div>

        {/* WiFi */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              measurements.wifi.rating === 'отлично' ? 'bg-success/10 text-success' :
              measurements.wifi.rating === 'хорошо' ? 'bg-primary/10 text-primary' :
              'bg-warning/10 text-warning'
            )}>
              <Wifi className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-medium">Wi-Fi</div>
              <div className={cn(
                'text-xs font-semibold',
                measurements.wifi.rating === 'отлично' ? 'text-success' :
                measurements.wifi.rating === 'хорошо' ? 'text-primary' : 'text-warning'
              )}>
                {measurements.wifi.rating}
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">{measurements.wifi.speed} <span className="text-sm font-normal text-muted">Мбит/с</span></div>
          <p className="text-xs text-muted">{measurements.wifi.details}</p>
        </div>

        {/* Workspace */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              measurements.hasWorkspace ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'
            )}>
              <Monitor className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-medium">Рабочее место</div>
              <div className={cn('text-xs font-semibold', measurements.hasWorkspace ? 'text-indigo-600' : 'text-gray-400')}>
                {measurements.hasWorkspace ? 'есть' : 'нет'}
              </div>
            </div>
          </div>
          {measurements.hasWorkspace && measurements.workspaceDetails ? (
            <p className="text-xs text-muted">{measurements.workspaceDetails}</p>
          ) : (
            <p className="text-xs text-muted">В номере нет выделенного рабочего места</p>
          )}
        </div>
      </div>
    </div>
  );
}
