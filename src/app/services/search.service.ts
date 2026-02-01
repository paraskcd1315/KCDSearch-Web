import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, effect, inject, Injectable, Signal, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Infobox, SearchAttributes, SearXNGResponse, SearXNGResult } from '../types/search.types';
import { SafeSearch, SearchCategory } from '../enums/search.enums';
import { SearchCacheService } from './cache/search-cache.service';
import {
  COUNTRY_TO_LANG,
  DEFAULT_SEARCH_MODEL,
  EMPTY_SEARCH_RESPONSE,
  SAFE_SEARCH_TO_SEARXNG,
} from '../utils/constants.utils';
import { form } from '@angular/forms/signals';
import { GeolocationService } from './map-search/geolocation.service';
import { LocationPermission } from '../enums/geolocation.enums';
import { runWithLoading } from '../utils/async.utils';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private readonly http = inject(HttpClient);
  private readonly searchCache = inject(SearchCacheService);
  private readonly geolocationService = inject(GeolocationService);
  private readonly searxngUrl = '/api/search';
  private readonly autocompleteUrl = '/api/autocomplete';

  readonly query = signal<string>('');
  readonly category = signal<SearchCategory>(SearchCategory.General);
  readonly engines = signal<string[]>([]);
  readonly currentPage = signal(1);
  readonly accumulatedResults = signal<SearXNGResult[]>([]);
  readonly information = signal<Infobox[]>([]);
  readonly isLoadingPage = signal(false);
  readonly hasMorePages = signal(true);
  readonly totalResults = signal(0);
  readonly error = signal<unknown>(null);
  readonly searchModel = signal<SearchAttributes>(DEFAULT_SEARCH_MODEL);

  readonly trimmedQuery = computed(() => this.query().trim());
  readonly results = computed(() => this.accumulatedResults());
  readonly isLoading = computed(() => this.isLoadingPage());
  readonly hasSearched = computed(() => this.trimmedQuery().length > 0);

  readonly searchQueryForm = form(this.query);
  readonly searchForm = form(this.searchModel);

  constructor() {
    this.init();
    effect(() => {
      localStorage.setItem('searchModel', JSON.stringify(this.searchModel()));
    });
    effect(() => {
      if (
        this.geolocationService.locationPermission() === LocationPermission.Granted &&
        this.trimmedQuery() &&
        this.hasSearched()
      ) {
        this.refreshSearch();
      }
    });
  }

  init(): void {
    const saved = localStorage.getItem('searchModel');
    this.searchModel.set(saved ? JSON.parse(saved) : DEFAULT_SEARCH_MODEL);
  }

  async search(query: string, category?: SearchCategory, engines?: string[]): Promise<void> {
    this.query.set(query);
    if (category != null) {
      this.category.set(category);
    }
    if (engines != null) {
      this.engines.set(engines);
    }
    await this.loadFirstPageAndApply();
  }

  async loadNextPage(): Promise<void> {
    if (!this.hasMorePages() || this.isLoadingPage()) {
      return;
    }
    const nextPage = this.currentPage() + 1;
    await this.withLoading(async () => {
      const resp = await this.loadPage(nextPage);
      this.applyNextPage(resp, nextPage);
    });
  }

  async autocomplete(query: string): Promise<string[]> {
    const q = query?.trim();
    if (!q || q.length < 2) {
      return [];
    }
    try {
      const response = await firstValueFrom(
        this.http.get<[string, string[]] | string[]>(this.autocompleteUrl, {
          params: new HttpParams().set('q', q),
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

  async refreshSearch(): Promise<void> {
    if (!this.trimmedQuery()) return;
    await this.loadFirstPageAndApply();
  }

  private resetPagination(): void {
    this.currentPage.set(1);
    this.accumulatedResults.set([]);
    this.hasMorePages.set(true);
  }

  private async withLoading<T>(fn: () => Promise<T>): Promise<T> {
    return runWithLoading(this.isLoadingPage.set.bind(this.isLoadingPage), fn, {
      onCatch: (e) => {
        this.hasMorePages.set(false);
        this.error.set(e);
      },
    });
  }

  private async loadFirstPageAndApply(): Promise<void> {
    this.resetPagination();
    await this.withLoading(async () => {
      const resp = await this.loadPage(1);
      this.applyFirstPage(resp);
    });
  }

  private params(page: number): HttpParams {
    const q = this.trimmedQuery();
    let p = new HttpParams().set('q', q).set('format', 'json').set('pageno', String(page));
    const lang = this.getEffectiveLanguage();
    if (lang) p = p.set('language', lang);
    const cat = this.category();
    if (cat) p = p.set('categories', cat);
    const eng = this.engines();
    if (eng.length > 0) p = p.set('engines', eng.join(','));
    const safe = this.safeSearchParam();
    if (safe) p = p.set('safesearch', safe);
    return p;
  }

  private safeSearchParam(): number | undefined {
    return SAFE_SEARCH_TO_SEARXNG[this.searchModel().safeSearch];
  }

  private async loadPage(page: number): Promise<SearXNGResponse> {
    const q = this.trimmedQuery();
    if (!q) return EMPTY_SEARCH_RESPONSE;
    const lang = this.getEffectiveLanguage();
    const safe = this.safeSearchParam();
    const cacheKey = this.searchCache.buildCacheKey(
      q,
      this.category(),
      page,
      this.engines(),
      lang,
      safe,
    );
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

  private getEffectiveLanguage(): string | undefined {
    if (!this.searchModel().useLocale) return undefined;
    const country = this.geolocationService.country();
    return country
      ? COUNTRY_TO_LANG[country]
      : (navigator.language.split('-')[0] ?? navigator.language);
  }
}
