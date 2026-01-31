import { MapPoi, OverpassElement } from '../types/map.types';

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function overpassCacheKey(lat: number, lon: number, radius: number): string {
  return `${round2(lat)}_${round2(lon)}_${radius}`;
}

export function elementToPoi(el: OverpassElement): MapPoi | null {
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (lat == null || lon == null) return null;
  const tags = el.tags ?? {};
  const name = tags['name'] ?? 'Unnamed';
  const type = tags['amenity'] ?? tags['shop'] ?? tags['tourism'] ?? el.type ?? 'Place';
  const parts = [
    tags['addr:house_number'],
    tags['addr:road'],
    tags['addr:city'] ?? tags['addr:town'] ?? tags['addr:village'],
    tags['addr:postcode'],
    tags['addr:country'],
  ].filter(Boolean);
  const address = parts.join(', ');
  const openingHours = tags['opening_hours'] ?? null;
  return {
    id: `${el.type}-${el.id}`,
    lat,
    lon,
    name,
    type,
    address,
    openingHours,
    raw: el,
  };
}
