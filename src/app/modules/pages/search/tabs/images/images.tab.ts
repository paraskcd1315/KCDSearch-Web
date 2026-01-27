import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../../../../services/search/search.service';
import { SearchImageResultComponent } from '../../../../components/search-image-result/search-image-result.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-images-tab',
  imports: [CommonModule, SearchImageResultComponent, MatProgressSpinnerModule],
  templateUrl: './images.tab.html',
  styleUrl: './images.tab.css',
})
export class ImagesTab {
  private readonly searchService = inject(SearchService);
  readonly results = this.searchService.results;
  readonly isLoadingPage = this.searchService.isLoadingPage;
  readonly hasMorePages = this.searchService.hasMorePages;
}