import { Injectable, isDevMode, signal } from '@angular/core';
import { AppConfig } from '../../types/config.types';

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private readonly configSignal = signal<AppConfig>({
    foursquareApiKey: '',
    foursquareApiVersion: '',
  });

  get config() {
    return this.configSignal();
  }

  load(): Promise<void> {
    if (!isDevMode()) {
      this.configSignal.set({ foursquareApiKey: '', foursquareApiVersion: '' });
      return Promise.resolve();
    }
    return fetch('/config.json')
      .then((res) =>
        res.ok
          ? (res.json() as Promise<AppConfig>)
          : Promise.resolve({ foursquareApiKey: '', foursquareApiVersion: '' }),
      )
      .then((config) => this.configSignal.set(config))
      .catch(() => {});
  }
}
