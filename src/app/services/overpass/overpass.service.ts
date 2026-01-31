import { inject, Injectable } from '@angular/core';
import { MapCacheService } from '../map-cache/map-cache.service';
import { MapPoi, OverpassResponse } from '../../types/map.types';
import { elementToPoi, overpassCacheKey } from '../../utils/overpass.utils';
import { OVERPASS_URL } from '../../utils/constants.utils';

@Injectable({
  providedIn: 'root',
})
export class OverpassService {
  private readonly cache = inject(MapCacheService);

  async getPois(lat: number, lon: number, radiusMeters: number = 500): Promise<MapPoi[]> {
    const cacheKey = overpassCacheKey(lat, lon, radiusMeters);
    const cached = await this.cache.getOverpass(cacheKey);
    if (cached && Array.isArray(cached)) return cached as MapPoi[];

    const query = `
      [out:json][timeout:15];
      (
        node(around:${radiusMeters},${lat},${lon})["amenity"]["name"];
        node(around:${radiusMeters},${lat},${lon})["shop"]["name"];
        way(around:${radiusMeters},${lat},${lon})["amenity"]["name"];
        way(around:${radiusMeters},${lat},${lon})["shop"]["name"];
      );
      out center;
    `;
    const response = await fetch(OVERPASS_URL, {
      method: 'POST',
      body: query,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (!response.ok) return [];
    const data = (await response.json()) as OverpassResponse;
    const pois = (data.elements ?? []).map(elementToPoi).filter((p): p is MapPoi => p !== null);
    await this.cache.setOverpass(cacheKey, pois);
    return pois;
  }
}
