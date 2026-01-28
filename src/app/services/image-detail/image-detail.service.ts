import { Injectable, signal } from '@angular/core';
import { SearXNGResult } from '../../types/search.types';

@Injectable({
  providedIn: 'root',
})
export class ImageDetailService {
  readonly selectedResult = signal<SearXNGResult | null>(null);

  open(result: SearXNGResult): void {
    this.selectedResult.set(result);
  }

  close(): void {
    this.selectedResult.set(null);
  }

  getImageSrc(): string {
    const result = this.selectedResult();
    if (!result) return '';
    if (typeof result.img_src === 'string') return result.img_src;
    if (Array.isArray(result.img_src) && result.img_src.length > 0) return result.img_src[0];
    return result.thumbnail_src || result.thumbnail || '';
  }
}
