import { cn } from '@/lib/utils';
import { Video, ShieldCheck, Volume2, Wifi, Monitor, Leaf, Users, Briefcase, Heart, PawPrint } from 'lucide-react';
import type { HotelBadge } from '@/data/types';

const badgeConfig: Record<HotelBadge['type'], { icon: React.ElementType; color: string }> = {
  'video-verified': { icon: Video, color: 'bg-primary/10 text-primary border-primary/20' },
  'no-surprises': { icon: ShieldCheck, color: 'bg-success/10 text-success border-success/20' },
  'quiet-zone': { icon: Volume2, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  'fast-wifi': { icon: Wifi, color: 'bg-purple-50 text-purple-600 border-purple-200' },
  'workspace': { icon: Monitor, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  'eco': { icon: Leaf, color: 'bg-green-50 text-green-600 border-green-200' },
  'family': { icon: Users, color: 'bg-orange-50 text-orange-600 border-orange-200' },
  'business': { icon: Briefcase, color: 'bg-slate-100 text-slate-600 border-slate-200' },
  'romantic': { icon: Heart, color: 'bg-pink-50 text-pink-600 border-pink-200' },
  'pet-friendly': { icon: PawPrint, color: 'bg-amber-50 text-amber-600 border-amber-200' },
  'guarantee': { icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
};

interface BadgeProps {
  badge: HotelBadge;
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({ badge, size = 'sm', className }: BadgeProps) {
  const config = badgeConfig[badge.type];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        config.color,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        className
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      {badge.label}
    </span>
  );
}
