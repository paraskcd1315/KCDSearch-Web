import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SearXNGResponse, SearXNGResult } from '../../types/search.types';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private readonly http = inject(HttpClient);
  private readonly searxngUrl = '/api/search';
  private readonly autocompleteUrl = '/api/autocomplete';

  readonly query = signal<string>('');
  readonly engines = signal<string[]>([]);
  readonly currentPage = signal<number>(1);
  readonly accumulatedResults = signal<SearXNGResult[]>([]);
  readonly isLoadingPage = signal<boolean>(false);
  readonly hasMorePages = signal<boolean>(true);
  readonly totalResults = signal<number>(0);

  readonly results = computed(() => this.accumulatedResults());
  readonly isLoading = computed(() => this.isLoadingPage());
  readonly hasSearched = computed(() => this.query().trim().length > 0);

  private async loadPage(page: number): Promise<SearXNGResult[]> {
    const query = this.query().trim();
    if (!query) return [];

    let httpParams = new HttpParams()
      .set('q', query)
      .set('format', 'json')
      .set('pageno', page.toString());

    const engines = this.engines();
    if (engines.length > 0) {
      httpParams = httpParams.set('engines', engines.join(','));
    }

    const response = await firstValueFrom(
      this.http.get<SearXNGResponse>(this.searxngUrl, { params: httpParams })
    );

    this.totalResults.set(response.number_of_results || 0);
    return response.results || [];
  }

  async autocomplete(query: string): Promise<string[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const httpParams = new HttpParams().set('q', query.trim());
      const response = await firstValueFrom(
        this.http.get<[string, string[]] | string[]>(this.autocompleteUrl, { params: httpParams })
      );

      if (Array.isArray(response) && response.length === 2 && Array.isArray(response[1])) {
        return response[1];
      }

      if (Array.isArray(response)) {
        return response as string[];
      }
      
      return [];
    } catch (error) {
      console.error('Autocomplete error:', error);
      return [];
    }
  }

  async search(query: string, engines?: string[]): Promise<void> {
    this.query.set(query);
    if (engines) {
      this.engines.set(engines);
    }
    
    this.currentPage.set(1);
    this.accumulatedResults.set([]);
    this.hasMorePages.set(true);
    this.isLoadingPage.set(true);

    try {
      const results = await this.loadPage(1);
      this.accumulatedResults.set(results);
      this.hasMorePages.set(results.length > 0);
    } catch (error) {
      this.hasMorePages.set(false);
      throw error;
    } finally {
      this.isLoadingPage.set(false);
    }
  }

  async loadNextPage(): Promise<void> {
    if (!this.hasMorePages() || this.isLoadingPage()) {
      return;
    }

    const nextPage = this.currentPage() + 1;
    this.isLoadingPage.set(true);

    try {
      const results = await this.loadPage(nextPage);
      
      if (results.length === 0) {
        this.hasMorePages.set(false);
      } else {
        this.accumulatedResults.update(current => [...current, ...results]);
        this.currentPage.set(nextPage);
      }
    } catch (error) {
      this.hasMorePages.set(false);
      throw error;
    } finally {
      this.isLoadingPage.set(false);
    }
  }

  clear(): void {
    this.query.set('');
    this.engines.set([]);
    this.currentPage.set(1);
    this.accumulatedResults.set([]);
    this.hasMorePages.set(true);
    this.isLoadingPage.set(false);
    this.totalResults.set(0);
  }

  get error(): Signal<unknown> {
    return signal(null);
  }
}