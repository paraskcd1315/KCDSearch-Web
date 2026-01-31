import { inject, Injectable, signal } from '@angular/core';
import { NominatimService } from '../nominatim/nominatim.service';
import { OverpassService } from '../overpass/overpass.service';
import { MapPoi } from '../../types/map.types';

@Injectable({
  providedIn: 'root',
})
export class MapSearchService {
  private readonly nominatim = inject(NominatimService);
  private readonly overpass = inject(OverpassService);

  readonly center = signal<{ lat: number; lon: number } | null>(null);
  readonly pois = signal<MapPoi[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  async runSearch(query: string): Promise<void> {
    const q = query.trim();
    if (!q) {
      this.center.set(null);
      this.pois.set([]);
      this.error.set(null);
      return;
    }
    this.center.set(null);
    this.pois.set([]);
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const results = await this.nominatim.search(q);
      if (results.length === 0) {
        this.error.set('No location found');
        this.center.set(null);
        this.pois.set([]);
        return;
      }
      const first = results[0];
      const lat = parseFloat(first.lat);
      const lon = parseFloat(first.lon);
      this.center.set({ lat, lon });
      const pois = await this.overpass.getPois(lat, lon, 500);
      this.pois.set(pois);
      this.error.set(null);
    } catch {
      this.error.set('Search failed');
      this.center.set(null);
      this.pois.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }
}
