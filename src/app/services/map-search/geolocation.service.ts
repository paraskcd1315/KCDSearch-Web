import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GeolocationService {
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
}
