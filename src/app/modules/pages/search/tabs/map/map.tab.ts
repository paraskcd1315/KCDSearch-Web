import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import type { Map as LMap } from 'leaflet';
import { MapPoiDetailService } from '../../../../../services/map-poi-detail/map-poi-detail.service';
import { MapSearchService } from '../../../../../services/map-search/map-search.service';
import { SearchService } from '../../../../../services/search/search.service';
import { MapPoi } from '../../../../../types/map.types';
import { isSearxngMapResult, searxngMapResultToMapPoi } from '../../../../../utils/map.utils';
import { MapDetailComponent } from '../../../../components/map-detail/map-detail.component';

@Component({
  selector: 'app-map.tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MapDetailComponent],
  templateUrl: './map.tab.html',
  styleUrl: './map.tab.css',
})
export class MapTab implements AfterViewInit {
  private readonly mapSearchService = inject(MapSearchService);
  private readonly searchService = inject(SearchService);
  private readonly poiDetail = inject(MapPoiDetailService);
  private readonly destroyRef = inject(DestroyRef);

  readonly mapSearch = this.mapSearchService;
  readonly mapContainer = signal<HTMLElement | null>(null);

  private map: LMap | null = null;
  private markerLayerRef: unknown = null;
  private mapContainerRef = viewChild<ElementRef<HTMLDivElement>>('mapContainer');

  constructor() {
    effect(() => {
      const ref = this.mapContainerRef();
      if (ref?.nativeElement && !this.map) {
        this.initMap(ref.nativeElement);
      }
    });

    effect(() => {
      this.mapSearchService.center();
      this.mapSearchService.pois();
      this.searchService.results();
      if (!this.map) return;
      this.updateMapFromState();
    });
  }

  ngAfterViewInit(): void {
    this.initMapWhenReady();
    this.destroyRef.onDestroy(() => this.destroyMap());
  }

  private initMap(container: HTMLElement): void {
    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => void })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'assets/map/marker-icon.png',
        iconRetinaUrl: 'assets/map/marker-icon-2x.png',
        shadowUrl: 'assets/map/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      this.map = L.map(container).setView([20, 0], 2);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(this.map);
      setTimeout(() => this.map?.invalidateSize(), 100);
      this.updateMapFromState();
    });
  }

  private initMapWhenReady(): void {
    const maxAttempts = 50;
    let attempts = 0;
    const id = setInterval(() => {
      attempts++;
      const el = document.getElementById('map') ?? this.mapContainerRef()?.nativeElement;
      if (el && !this.map) {
        this.initMap(el);
        clearInterval(id);
        return;
      }
      if (attempts >= maxAttempts) clearInterval(id);
    }, 100);
    this.destroyRef.onDestroy(() => clearInterval(id));
  }

  private destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private setPoiMarkers(pois: MapPoi[]): void {
    if (!this.map) return;
    this.clearPoiMarkers();
    if (pois.length === 0) return;
    import('leaflet').then((L) => {
      const group = L.layerGroup();
      for (const poi of pois) {
        const marker = L.marker([poi.lat, poi.lon])
          .bindPopup(poi.name)
          .on('click', () => this.poiDetail.open(poi));
        group.addLayer(marker);
      }
      group.addTo(this.map!);
      this.markerLayerRef = group;
    });
  }

  private updateMapFromState(): void {
    if (!this.map) return;

    const searchResults = this.searchService.results();
    const center = this.mapSearchService.center();
    const pois = this.mapSearchService.pois();

    const searxngMapResults = searchResults.filter(isSearxngMapResult);
    const searxngPois = searxngMapResults.map((r, i) => searxngMapResultToMapPoi(r, i));
    const allPois = [...searxngPois, ...pois];

    if (searxngPois.length > 0) {
      const first = searxngPois[0];
      this.map.flyTo([first.lat, first.lon], 14);
    } else if (center) {
      this.map.flyTo([center.lat, center.lon], 14);
    }

    if (allPois.length > 0) {
      this.setPoiMarkers(allPois);
    } else {
      this.clearPoiMarkers();
    }
  }

  private clearPoiMarkers(): void {
    if (!this.map) return;
    if (this.markerLayerRef) {
      this.map.removeLayer(this.markerLayerRef as never);
      this.markerLayerRef = null;
    }
  }
}
