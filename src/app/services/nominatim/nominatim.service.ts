import { inject, Injectable } from '@angular/core';
import { MapCacheService } from '../map-cache/map-cache.service';
import { NominatimResult } from '../../types/map.types';
import { NOMINATIM_URL, USER_AGENT } from '../../utils/constants.utils';

@Injectable({
  providedIn: 'root',
})
export class NominatimService {
  private readonly cache = inject(MapCacheService);

  async search(query: string): Promise<NominatimResult[]> {
    const q = query.trim();
    if (!q) return [];

    const cached = await this.cache.getNominatim(q);
    if (cached && Array.isArray(cached)) return cached as NominatimResult[];

    const params = new URLSearchParams({
      q,
      format: 'json',
      limit: '5',
      addressdetails: '1',
    });
    const response = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: { 'User-Agent': USER_AGENT },
    });
    if (!response.ok) return [];
    const data = (await response.json()) as NominatimResult[];
    await this.cache.setNominatim(q, data);
    return data;
  }
}
