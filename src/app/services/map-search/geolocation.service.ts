import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { COUNTRY_TO_LANG } from '../../utils/constants.utils';

@Injectable({ providedIn: 'root' })
export class GeolocationService {
  private readonly http = inject(HttpClient);
  readonly country = signal<string | null>(null);

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
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
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

  async init(): Promise<void> {
    if (localStorage.getItem('country')) {
      this.country.set(localStorage.getItem('country') as string);
      return;
    }
    const { lat, lon } = await this.getCurrentCoords();
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    try {
      const res = await firstValueFrom(
        this.http.get<{ address?: { country_code?: string } }>(url, {
          headers: { 'Accept-Language': 'en' },
        }),
      );
      const cc = res?.address?.country_code?.toUpperCase();

      if (cc) {
        this.country.set(COUNTRY_TO_LANG[cc]);
        localStorage.setItem('country', cc);
      }
    } catch {
      this.country.set(null);
      localStorage.removeItem('country');
    }
  }
}
