import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SearchService } from '../services/search/search.service';
import { SearXNGResult } from '../types/search.types';

@Component({
  selector: 'app-search',
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent {
  private readonly searchService = inject(SearchService);

  readonly searchQuery = signal('');
  readonly query = this.searchService.query;
  readonly results = this.searchService.results;
  readonly isLoading = this.searchService.isLoading;
  readonly hasMorePages = this.searchService.hasMorePages;
  readonly totalResults = this.searchService.totalResults;
  readonly hasSearched = this.searchService.hasSearched;

  readonly hasResults = computed(() => this.results().length > 0);
  readonly showEmptyState = computed(() => 
    !this.isLoading() && 
    !this.hasSearched() && 
    !this.searchQuery().trim()
  );
  readonly isLoadingMore = computed(() => 
    this.isLoading() && this.hasResults()
  );

  constructor() {
    // Auto-load more when scrolling near bottom
    effect(() => {
      if (this.hasMorePages() && !this.isLoading()) {
        // This will be triggered by scroll events
      }
    });
  }

  onSearch(): void {
    const query = this.searchQuery().trim();
    if (query) {
      this.searchService.search(query).catch(() => {
        // Error handling is done in the service
      });
    }
  }

  onClear(): void {
    this.searchQuery.set('');
    this.searchService.clear();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onSearch();
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.shouldLoadMore()) {
      this.loadMore();
    }
  }

  private shouldLoadMore(): boolean {
    if (!this.hasMorePages() || this.isLoading()) {
      return false;
    }

    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    const threshold = 200; // Load more when 200px from bottom

    return scrollPosition >= documentHeight - threshold;
  }

  loadMore(): void {
    if (this.hasMorePages() && !this.isLoading()) {
      this.searchService.loadNextPage().catch(() => {
        // Error handling
      });
    }
  }

  formatUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  trackByUrl(_index: number, result: SearXNGResult): string {
    return result.url;
  }
}