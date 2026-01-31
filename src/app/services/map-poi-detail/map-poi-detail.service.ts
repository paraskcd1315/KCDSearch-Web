import { Injectable, signal } from '@angular/core';
import { MapPoi } from '../../types/map.types';

@Injectable({
  providedIn: 'root',
})
export class MapPoiDetailService {
  readonly selectedPoi = signal<MapPoi | null>(null);

  open(poi: MapPoi): void {
    this.selectedPoi.set(poi);
  }

  close(): void {
    this.selectedPoi.set(null);
  }
}
