// Маппинг cityId из наших данных → Ostrovok region_id
// region_id можно найти через multicomplete API или в документации

export const regionMap: Record<string, number> = {
  moscow: 2735,
  spb: 6053839,
  sochi: 69988,
  kazan: 78087,
  kaliningrad: 73082,
};

export function getRegionId(cityId: string): number | undefined {
  return regionMap[cityId];
}

// Обратный маппинг: region_id → cityId
const reverseMap: Record<number, string> = Object.fromEntries(
  Object.entries(regionMap).map(([cityId, regionId]) => [regionId, cityId])
);

export function getCityIdByRegion(regionId: number): string | undefined {
  return reverseMap[regionId];
}
