import { MapPoi } from '../types/map.types';
import { FoursquarePlaceResult } from '../types/map.types';

export function foursquarePlaceToMapPoi(p: FoursquarePlaceResult): MapPoi {
  const photo = p.photos?.[0];
  const imageUrl =
    photo?.prefix != null && photo?.suffix != null
      ? `${photo.prefix}original${photo.suffix}`
      : null;
  return {
    id: p.fsq_place_id,
    lat: p.latitude,
    lon: p.longitude,
    name: p.name ?? '',
    type: p.categories?.[0]?.name ?? 'Place',
    address: p.location?.formatted_address ?? p.location?.address ?? '',
    openingHours: p.hours?.display ?? null,
    imageUrl,
    website: p.website ?? null,
    phone: p.tel ?? null,
    rating: p.rating ?? null,
  };
}

export function roundToGeoLocationPrecision(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
