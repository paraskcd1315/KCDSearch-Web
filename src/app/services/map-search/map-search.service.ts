import { inject, Injectable, signal } from '@angular/core';
import { MapPoi } from '../../types/map.types';
import { FoursquareService } from './foursquare.service';
import { foursquarePlaceToMapPoi } from '../../utils/map.utils';

@Injectable({
  providedIn: 'root',
})
export class MapSearchService {
  private readonly foursquare = inject(FoursquareService);

  readonly center = signal<{ lat: number; lon: number } | null>(null);
  readonly pois = signal<MapPoi[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  async runSearch(query: string): Promise<void> {
    const q = query.trim();
    this.clearState();
    if (!q) return;

    this.isLoading.set(true);
    try {
      const results = await this.foursquare.search(q);
      if (results.length === 0) {
        this.error.set('No location found');
        return;
      }
      const first = results[0];
      this.center.set({ lat: first.latitude, lon: first.longitude });
      this.pois.set(results.map(foursquarePlaceToMapPoi));
    } catch {
      this.error.set('Search failed');
    } finally {
      this.isLoading.set(false);
    }
  }

  private clearState(): void {
    this.center.set(null);
    this.pois.set([]);
    this.error.set(null);
  }
}
