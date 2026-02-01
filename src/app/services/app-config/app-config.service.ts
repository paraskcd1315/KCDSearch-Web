import { Injectable, signal } from '@angular/core';
import { AppConfig } from '../../types/config.types';

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private readonly configSignal = signal<AppConfig>({ foursquareApiKey: '' });

  get config() {
    return this.configSignal();
  }

  load(): Promise<void> {
    return fetch('/config.json')
      .then((res) =>
        res.ok ? (res.json() as Promise<AppConfig>) : Promise.resolve({ foursquareApiKey: '' }),
      )
      .then((config) => this.configSignal.set(config))
      .catch(() => {});
  }
}
