import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  COUNTRY_TO_LANG,
  DEFAULT_POSITION_OPTIONS,
  REVERSE_GEOCODING_API_URL,
} from '../../utils/constants.utils';
import { LocationPermission } from '../../enums/geolocation.enums';

@Injectable({ providedIn: 'root' })
export class GeolocationService {
  private readonly http = inject(HttpClient);

  readonly country = signal<string | null>(null);
  readonly locationPermission = signal<LocationPermission>(LocationPermission.Prompt);

  constructor() {
    this.init();
  }

  getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator?.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        ...DEFAULT_POSITION_OPTIONS,
        ...options,
      });
    });
  }

  getCurrentCoords(): Promise<{ lat: number; lon: number }> {
    return this.getCurrentPosition().then((pos) => ({
      lat: pos.coords.latitude,
      lon: pos.coords.longitude,
    }));
  }

  async requestLocation(): Promise<void> {
    try {
      const { lat, lon } = await this.getCurrentCoords();
      const cc = await this.reverseGeocode(lat, lon);

      if (cc) {
        this.country.set(cc);
        localStorage.setItem('country', cc);
      }
      this.locationPermission.set(LocationPermission.Granted);
    } catch {
      this.locationPermission.set(LocationPermission.Denied);
    }
  }

  private async init(): Promise<void> {
    const stored = localStorage.getItem('country');
    if (stored) {
      this.country.set(stored);
      return;
    }
    try {
      const perm = await navigator.permissions?.query({ name: 'geolocation' });
      if (perm?.state === 'granted') {
        const { lat, lon } = await this.getCurrentCoords();
        const cc = await this.reverseGeocode(lat, lon);
        if (cc) {
          this.country.set(cc);
          localStorage.setItem('country', cc);
        }
        this.locationPermission.set(LocationPermission.Granted);
      } else if (perm?.state === LocationPermission.Denied) {
        this.locationPermission.set(LocationPermission.Denied);
      }
    } catch {
      this.locationPermission.set(LocationPermission.Prompt);
    }
  }

  private async reverseGeocode(lat: number, lon: number): Promise<string | null> {
    const params = new HttpParams().set('lat', lat).set('lon', lon).set('format', 'json');
    const url = `${REVERSE_GEOCODING_API_URL}?${params.toString()}`;
    const res = await firstValueFrom(
      this.http.get<{ address?: { country_code?: string } }>(url, {
        headers: { 'Accept-Language': 'en' },
      }),
    );
    const cc = res?.address?.country_code?.toUpperCase();

    return cc && COUNTRY_TO_LANG[cc] ? cc : null;
  }
}
