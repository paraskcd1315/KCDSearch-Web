import { Component, computed, inject } from '@angular/core';
import { ImageDetailService } from '../../../services/image-detail.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-search-image-result-detail',
  imports: [CommonModule, MatIconModule],
  templateUrl: './search-image-result-detail.component.html',
  styleUrl: './search-image-result-detail.component.css',
})
export class SearchImageResultDetailComponent {
  private readonly imageDetailService = inject(ImageDetailService);
  readonly result = computed(() => this.imageDetailService.selectedResult());

  closeImageDetail(): void {
    this.imageDetailService.close();
  }

  getImageSrc(): string {
    return this.imageDetailService.getImageSrc();
  }
}
