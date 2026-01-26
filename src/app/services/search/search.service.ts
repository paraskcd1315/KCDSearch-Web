import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Infobox, SearXNGResponse, SearXNGResult } from '../../types/search.types';
import { SearchCategory } from '../../enums/search.enums';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private readonly http = inject(HttpClient);
  private readonly searxngUrl = '/api/search';
  private readonly autocompleteUrl = '/api/autocomplete';

  readonly query = signal<string>('');
  readonly category = signal<SearchCategory>(SearchCategory.General);
  readonly engines = signal<string[]>([]);
  readonly currentPage = signal<number>(1);
  readonly accumulatedResults = signal<SearXNGResult[]>([]);
  readonly information = signal<Infobox[]>([]);
  readonly isLoadingPage = signal<boolean>(false);
  readonly hasMorePages = signal<boolean>(true);
  readonly totalResults = signal<number>(0);

  readonly results = computed(() => this.accumulatedResults());
  readonly isLoading = computed(() => this.isLoadingPage());
  readonly hasSearched = computed(() => this.query().trim().length > 0);

  private buildSearchParams(page: number): HttpParams {
    let params = new HttpParams()
      .set('q', this.query().trim())
      .set('format', 'json')
      .set('pageno', page.toString());

    const category = this.category();
    if (category) {
      params = params.set('categories', category);
    }

    const engines = this.engines();
    if (engines.length > 0) {
      params = params.set('engines', engines.join(','));
    }

    return params;
  }

  private async loadPage(page: number): Promise<SearXNGResponse> {
    const query = this.query().trim();
    if (!query) return {
      query: '',
      number_of_results: 0,
      results: [],
      answers: [],
      corrections: [],
      infoboxes: [],
      suggestions: [],
      unresponsive_engines: [],
    };

    const response = await firstValueFrom(
      this.http.get<SearXNGResponse>(this.searxngUrl, {
        params: this.buildSearchParams(page),
      })
    );

    this.totalResults.set(response.number_of_results ?? 0);
    return response;
  }

  private async executeWithLoading<T>(
    operation: () => Promise<T>,
    onError?: (error: unknown) => void
  ): Promise<T> {
    this.isLoadingPage.set(true);
    try {
      return await operation();
    } catch (error) {
      this.hasMorePages.set(false);
      onError?.(error);
      throw error;
    } finally {
      this.isLoadingPage.set(false);
    }
  }

  async autocomplete(query: string): Promise<string[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const httpParams = new HttpParams().set('q', query.trim());
      const response = await firstValueFrom(
        this.http.get<[string, string[]] | string[]>(this.autocompleteUrl, {
          params: httpParams,
        })
      );

      // Handle different response formats
      if (Array.isArray(response) && response.length === 2 && Array.isArray(response[1])) {
        return response[1];
      }

      return Array.isArray(response) ? response as string[] : [];
    } catch (error) {
      console.error('Autocomplete error:', error);
      return [];
    }
  }

  async search(
    query: string,
    category?: SearchCategory,
    engines?: string[]
  ): Promise<void> {
    this.query.set(query);
    if (category) this.category.set(category);
    if (engines) this.engines.set(engines);

    this.resetPagination();

    await this.executeWithLoading(async () => {
      const resp = await this.loadPage(1);
      this.accumulatedResults.set(resp.results);
      this.hasMorePages.set(resp.number_of_results > 0);
      this.information.set(resp.infoboxes ?? []);
    });
  }

  async loadNextPage(): Promise<void> {
    if (!this.hasMorePages() || this.isLoadingPage()) {
      return;
    }

    const nextPage = this.currentPage() + 1;

    await this.executeWithLoading(async () => {
      const resp = await this.loadPage(nextPage);

      if (resp.results.length === 0) {
        this.hasMorePages.set(false);
      } else {
        this.accumulatedResults.update((current) => [...current, ...resp.results]);
        this.information.set(resp.infoboxes ?? []);
        this.currentPage.set(nextPage);
      }
    });
  }

  private resetPagination(): void {
    this.currentPage.set(1);
    this.accumulatedResults.set([]);
    this.hasMorePages.set(true);
  }

  setCategory(category: SearchCategory): void {
    this.category.set(category);
  }

  clear(): void {
    this.query.set('');
    this.category.set(SearchCategory.General);
    this.engines.set([]);
    this.totalResults.set(0);
    this.resetPagination();
    this.isLoadingPage.set(false);
    this.information.set([]);
  }

  get error(): Signal<unknown> {
    return signal(null);
  }
}