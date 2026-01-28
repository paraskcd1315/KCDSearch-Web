import {
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../../../../services/search/search.service';
import { SearchImageResultComponent } from '../../../../components/search-image-result/search-image-result.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SearXNGResult } from '../../../../../types/search.types';
import { ImageDetailService } from '../../../../../services/image-detail/image-detail.service';

const COLUMN_MIN_WIDTH = 200;
const COLUMN_GAP = 20;

@Component({
  selector: 'app-images-tab',
  imports: [CommonModule, SearchImageResultComponent, MatProgressSpinnerModule],
  templateUrl: './images.tab.html',
  styleUrl: './images.tab.css',
})
export class ImagesTab implements AfterViewInit {
  private readonly searchService = inject(SearchService);
  private readonly destroyRef = inject(DestroyRef);
  readonly imageDetailService = inject(ImageDetailService);

  @ViewChild('containerRef') containerRef!: { nativeElement: HTMLDivElement };

  readonly results = this.searchService.results;
  readonly isLoadingPage = this.searchService.isLoadingPage;
  readonly hasMorePages = this.searchService.hasMorePages;

  readonly columnCount = signal(1);

  readonly columns = computed(() => {
    const r = this.results();
    const n = Math.max(1, this.columnCount());
    const cols: SearXNGResult[][] = Array.from({ length: n }, () => []);
    r.forEach((item, i) => cols[i % n].push(item));
    return cols;
  });

  ngAfterViewInit(): void {
    const el = this.containerRef?.nativeElement;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = entry.contentRect.width;
      const n = Math.max(1, Math.floor((w + COLUMN_GAP) / (COLUMN_MIN_WIDTH + COLUMN_GAP)));
      this.columnCount.set(n);
    });

    ro.observe(el);
    this.destroyRef.onDestroy(() => ro.disconnect());
  }

  openDetail(result: SearXNGResult): void {
    this.imageDetailService.open(result);
  }
}
