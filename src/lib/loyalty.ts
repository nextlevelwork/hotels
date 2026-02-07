export type LoyaltyTier = 'bronze' | 'silver' | 'gold';

export interface LoyaltyTierInfo {
  tier: LoyaltyTier;
  label: string;
  cashbackPercent: number;
  minSpent: number;
  color: string;
  bgColor: string;
}

export const LOYALTY_TIERS: LoyaltyTierInfo[] = [
  { tier: 'gold', label: 'Золото', cashbackPercent: 10, minSpent: 150_000, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { tier: 'silver', label: 'Серебро', cashbackPercent: 7, minSpent: 50_000, color: 'text-gray-500', bgColor: 'bg-gray-100' },
  { tier: 'bronze', label: 'Бронза', cashbackPercent: 5, minSpent: 0, color: 'text-orange-600', bgColor: 'bg-orange-100' },
];

export function getTierBySpent(totalSpent: number): LoyaltyTierInfo {
  return LOYALTY_TIERS.find((t) => totalSpent >= t.minSpent) || LOYALTY_TIERS[LOYALTY_TIERS.length - 1];
}

export function calculateBonusEarned(finalPrice: number, totalSpent: number): number {
  const tier = getTierBySpent(totalSpent);
  return Math.round(finalPrice * (tier.cashbackPercent / 100));
}

/** Maximum bonus a user can spend on a booking (50% of subtotal) */
export function maxBonusSpend(subtotal: number, userBalance: number): number {
  const halfSubtotal = Math.floor(subtotal * 0.5);
  return Math.min(halfSubtotal, userBalance);
}

export function getNextTier(totalSpent: number): { tier: LoyaltyTierInfo; remaining: number } | null {
  const currentIdx = LOYALTY_TIERS.findIndex((t) => totalSpent >= t.minSpent);
  if (currentIdx <= 0) return null; // already gold or no tiers
  const next = LOYALTY_TIERS[currentIdx - 1];
  return { tier: next, remaining: next.minSpent - totalSpent };
}
