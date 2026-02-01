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
    const key = this.appConfig.config.foursquareApiKey ?? '';
    const version = this.appConfig.config.foursquareApiVersion ?? '';
    const { lat, lon } = await this.geolocation.getCurrentCoords();
    const cacheKey = this.cacheKey(lat, lon, query);
    const cached = await this.cache.getFoursquare(cacheKey);
    if (Array.isArray(cached)) return cached as FoursquarePlaceResult[];

    const results = await this.fetchPlaces(version, key, query, lat, lon);
    await this.cache.setFoursquare(cacheKey, results);
    return results;
  }

  private cacheKey(lat: number, lon: number, query: string): string {
    return `${lat}|${lon}|${query.trim().toLowerCase()}`;
  }

  private async fetchPlaces(
    version: string,
    key: string,
    query: string,
    lat: number,
    lon: number,
  ): Promise<FoursquarePlaceResult[]> {
    const headers: Record<string, string> = {
      accept: 'application/json',
    };

    if (key) headers['Authorization'] = `Bearer ${key}`;
    if (version) headers['X-Places-Api-Version'] = version;

    const res = await firstValueFrom(
      this.http.get<FoursquareSearchResponse>(FOURSQUARE_API_URL_SEARCH, {
        params: { query: query.trim(), limit: '12', ll: `${lat},${lon}` },
        headers,
      }),
    );
    return res.results ?? [];
  }
}
