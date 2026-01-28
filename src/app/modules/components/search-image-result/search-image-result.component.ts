import { CommonModule, DatePipe } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SearXNGResult } from '../../../types/search.types';

@Component({
  selector: 'app-search-image-result',
  imports: [CommonModule, MatCardModule, DatePipe, MatTooltipModule],
  templateUrl: './search-image-result.component.html',
  styleUrl: './search-image-result.component.css',
})
export class SearchImageResultComponent {
  readonly result = input<SearXNGResult>();
  readonly imageError = signal<boolean>(false);
  readonly imageClick = output<SearXNGResult>();

  readonly FIXED_HEIGHT = 228;
  readonly DEFAULT_FLEX_BASIS = 171.594;

  getFlexBasis(result: SearXNGResult | undefined): number {
    if (!result || !result.resolution) {
      return this.DEFAULT_FLEX_BASIS;
    }

    const match = result.resolution.match(/(\d+)\s*x\s*(\d+)/i);
    if (!match) {
      return this.DEFAULT_FLEX_BASIS;
    }

    const width = parseInt(match[1], 10);
    const height = parseInt(match[2], 10);

    if (height === 0) {
      return this.DEFAULT_FLEX_BASIS;
    }

    const calculatedWidth = (width / height) * this.FIXED_HEIGHT;

    return Math.max(100, Math.min(400, calculatedWidth));
  }

  getWidth(result: SearXNGResult | undefined): number {
    const flexBasis = this.getFlexBasis(result);
    return flexBasis;
  }

  getImageSrc(result: SearXNGResult | undefined): string {
    if (!result) {
      return '';
    }
    if (typeof result.img_src === 'string') {
      return result.img_src;
    }
    if (Array.isArray(result.img_src) && result.img_src.length > 0) {
      return result.img_src[0];
    }
    return result.thumbnail_src || result.thumbnail || '';
  }

  onImageError(): void {
    this.imageError.set(true);
  }

  getAspectRatio(result: SearXNGResult | undefined): string {
    if (!result?.resolution) return '1';
    const match = result.resolution.match(/(\d+)\s*x\s*(\d+)/i);
    if (!match) return '1';
    const w = parseInt(match[1], 10);
    const h = parseInt(match[2], 10);
    if (h === 0) return '1';
    return `${w}/${h}`;
  }

  onImageClick(event: Event): void {
    event.preventDefault();
    const r = this.result();
    if (r) this.imageClick.emit(r);
  }
}
