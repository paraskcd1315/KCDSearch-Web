import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MapPoiDetailService } from '../../../services/map-search/map-poi-detail.service';

@Component({
  selector: 'app-map-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  templateUrl: './map-detail.component.html',
  styleUrl: './map-detail.component.css',
})
export class MapDetailComponent {
  private readonly poiDetail = inject(MapPoiDetailService);
  readonly poi = computed(() => this.poiDetail.selectedPoi());

  close(): void {
    this.poiDetail.close();
  }
}
