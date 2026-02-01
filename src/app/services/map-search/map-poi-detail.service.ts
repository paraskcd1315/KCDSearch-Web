import { inject, Injectable, signal } from '@angular/core';
import { MapPoi } from '../../types/map.types';
import { FoursquareService } from './foursquare.service';

@Injectable({
  providedIn: 'root',
})
export class MapPoiDetailService {
  private readonly foursquare = inject(FoursquareService);
  readonly selectedPoi = signal<MapPoi | null>(null);

  open(poi: MapPoi): void {
    this.selectedPoi.set(poi);
  }

  close(): void {
    this.selectedPoi.set(null);
  }
}
