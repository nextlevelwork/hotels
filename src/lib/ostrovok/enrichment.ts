import type { RealMeasurements, HotelBadge } from '@/data/types';
import {
  getEnrichment,
  getDefaultMeasurements,
  getDefaultBadges,
  type EnrichmentData,
} from '@/data/ostrovok-enrichment';

export interface ResolvedEnrichment {
  measurements: RealMeasurements;
  badges: HotelBadge[];
  videoUrl?: string;
  bidEnabled: boolean;
  hasVideoVerification: boolean;
  isVerified: boolean;
}

export function resolveEnrichment(hid: number): ResolvedEnrichment {
  const enrichment = getEnrichment(hid);

  if (enrichment) {
    return {
      measurements: enrichment.measurements,
      badges: enrichment.badges,
      videoUrl: enrichment.videoUrl,
      bidEnabled: enrichment.bidEnabled,
      hasVideoVerification: enrichment.badges.some(b => b.type === 'video-verified'),
      isVerified: true,
    };
  }

  return {
    measurements: getDefaultMeasurements(),
    badges: getDefaultBadges(),
    videoUrl: undefined,
    bidEnabled: false,
    hasVideoVerification: false,
    isVerified: false,
  };
}
