import { MapPoi } from '../types/map.types';
import { SearXNGResult } from '../types/search.types';

export function isSearxngMapResult(r: SearXNGResult): boolean {
  return typeof r.latitude === 'number' && typeof r.longitude === 'number' && !!r.title;
}

export function formatSearxngAddress(addr: SearXNGResult['address']): string {
  if (!addr) return '';
  const parts = [
    addr.name,
    addr?.road,
    addr?.house_number,
    addr?.locality,
    addr?.postcode,
    addr?.country,
  ].filter(Boolean);
  return parts.join(', ');
}

export function getSearxngImageUrl(r: SearXNGResult): string | null {
  if (r.img_src) {
    if (typeof r.img_src === 'string') return r.img_src;
  }
  if (r.thumbnail_src) {
    if (typeof r.thumbnail_src === 'string') return r.thumbnail_src;
  }
  if (r.thumbnail && typeof r.thumbnail === 'string') return r.thumbnail;
  return null;
}

export function searxngMapResultToMapPoi(r: SearXNGResult, index: number): MapPoi {
  return {
    id: `searxng-${r.url}-${index}`,
    lat: r.latitude!,
    lon: r.longitude!,
    name: r.title,
    type: r.engine ?? 'Place',
    address: formatSearxngAddress(r.address),
    openingHours: null,
    raw: { type: 'node', id: r.osm?.id ?? 0, tags: {}, lat: r.latitude, lon: r.longitude },
    imageUrl: getSearxngImageUrl(r),
  };
}
