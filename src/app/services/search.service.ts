import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Infobox, SearXNGResponse, SearXNGResult } from '../types/search.types';
import { SearchCategory } from '../enums/search.enums';
import { SearchCacheService } from './cache/search-cache.service';
import { EMPTY_SEARCH_RESPONSE } from '../utils/constants.utils';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private readonly http = inject(HttpClient);
  private readonly searchCache = inject(SearchCacheService);
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
  readonly error = signal<unknown>(null);

  readonly results = computed(() => this.accumulatedResults());
  readonly isLoading = computed(() => this.isLoadingPage());
  readonly hasSearched = computed(() => this.query().trim().length > 0);

  async search(query: string, category?: SearchCategory, engines?: string[]): Promise<void> {
    this.query.set(query);
    if (category != null) this.category.set(category);
    if (engines != null) this.engines.set(engines);
    this.resetPagination();

    await this.withLoading(async () => {
      const resp = await this.loadPage(1);
      this.applyFirstPage(resp);
    });
  }

  async loadNextPage(): Promise<void> {
    if (!this.hasMorePages() || this.isLoadingPage()) return;

    const nextPage = this.currentPage() + 1;
    await this.withLoading(async () => {
      const resp = await this.loadPage(nextPage);
      this.applyNextPage(resp, nextPage);
    });
  }

  async autocomplete(query: string): Promise<string[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      const response = await firstValueFrom(
        this.http.get<[string, string[]] | string[]>(this.autocompleteUrl, {
          params: new HttpParams().set('q', query.trim()),
        }),
      );
      return this.parseSuggestions(response);
    } catch (e) {
      console.error('Autocomplete error:', e);
      return [];
    }
  }

  setCategory(category: SearchCategory): void {
    this.category.set(category);
  }

  clear(): void {
    this.query.set('');
    this.category.set(SearchCategory.General);
    this.engines.set([]);
    this.totalResults.set(0);
    this.information.set([]);
    this.isLoadingPage.set(false);
    this.resetPagination();
  }

  private resetPagination(): void {
    this.currentPage.set(1);
    this.accumulatedResults.set([]);
    this.hasMorePages.set(true);
  }

  private async withLoading<T>(fn: () => Promise<T>): Promise<T> {
    this.isLoadingPage.set(true);
    try {
      return await fn();
    } catch (e) {
      this.hasMorePages.set(false);
      this.error.set(e);
      throw e;
    } finally {
      this.isLoadingPage.set(false);
    }
  }

  private params(page: number): HttpParams {
    let p = new HttpParams()
      .set('q', this.query().trim())
      .set('format', 'json')
      .set('pageno', String(page));
    const cat = this.category();
    if (cat) p = p.set('categories', cat);
    const eng = this.engines();
    if (eng.length > 0) p = p.set('engines', eng.join(','));
    return p;
  }

  private async loadPage(page: number): Promise<SearXNGResponse> {
    const q = this.query().trim();
    if (!q) return EMPTY_SEARCH_RESPONSE;

    const cacheKey = this.searchCache.buildCacheKey(q, this.category(), page, this.engines());
    const cached = await this.searchCache.get(cacheKey);
    if (cached) {
      this.totalResults.set(cached.number_of_results ?? 0);
      return cached;
    }

    const response = await firstValueFrom(
      this.http.get<SearXNGResponse>(this.searxngUrl, { params: this.params(page) }),
    );
    await this.searchCache.set(cacheKey, response);
    this.totalResults.set(response.number_of_results ?? 0);
    return response;
  }

  private applyFirstPage(resp: SearXNGResponse): void {
    this.accumulatedResults.set(resp.results);
    this.hasMorePages.set(resp.results.length > 0);
    this.information.set(resp.infoboxes ?? []);
  }

  private applyNextPage(resp: SearXNGResponse, nextPage: number): void {
    if (resp.results.length === 0) {
      this.hasMorePages.set(false);
      return;
    }
    this.accumulatedResults.update((prev) => [...prev, ...resp.results]);
    if (resp.infoboxes?.length) this.information.set(resp.infoboxes);
    this.currentPage.set(nextPage);
  }

  private parseSuggestions(response: [string, string[]] | string[]): string[] {
    if (Array.isArray(response) && response.length === 2 && Array.isArray(response[1])) {
      return response[1];
    }
    return Array.isArray(response) ? (response as string[]) : [];
  }
}
