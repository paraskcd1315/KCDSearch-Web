import { inject, Injectable } from '@angular/core';
import { AppConfigService } from '../app-config/app-config.service';
import { FoursquarePlaceResult, FoursquareSearchResponse } from '../../types/map.types';
import { FOURSQUARE_API_URL_SEARCH } from '../../utils/constants.utils';
import { GeolocationService } from './geolocation.service';
import { MapCacheService } from '../cache/map-cache.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FoursquareService {
  private readonly cache = inject(MapCacheService);
  private readonly appConfig = inject(AppConfigService);
  private readonly geolocation = inject(GeolocationService);
  private readonly http = inject(HttpClient);

  async search(query: string): Promise<FoursquarePlaceResult[]> {
    const key = this.appConfig.config.foursquareApiKey;
    if (!key) return [];

    const { lat, lon } = await this.geolocation.getCurrentCoords();
    const cacheKey = this.cacheKey(lat, lon, query);
    const cached = await this.cache.getFoursquare(cacheKey);
    if (Array.isArray(cached)) return cached as FoursquarePlaceResult[];

    const results = await this.fetchPlaces(key, query, lat, lon);
    await this.cache.setFoursquare(cacheKey, results);
    return results;
  }

  private cacheKey(lat: number, lon: number, query: string): string {
    return `${lat}|${lon}|${query.trim().toLowerCase()}`;
  }

  private async fetchPlaces(
    key: string,
    query: string,
    lat: number,
    lon: number,
  ): Promise<FoursquarePlaceResult[]> {
    const res = await firstValueFrom(
      this.http.get<FoursquareSearchResponse>(FOURSQUARE_API_URL_SEARCH, {
        params: { query: query.trim(), limit: '12', ll: `${lat},${lon}` },
        headers: {
          Authorization: `Bearer ${key}`,
          'X-Places-Api-Version': '2025-06-17',
          accept: 'application/json',
        },
      }),
    );
    return res.results ?? [];
  }
}
