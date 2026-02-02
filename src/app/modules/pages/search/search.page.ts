import { CommonModule, NgComponentOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
  Type,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SearchService } from '../../../services/search.service';
import { Subscription } from 'rxjs';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { searchTabs } from '../../../utils/search.utils';
import { SearchCategory } from '../../../enums/search.enums';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ImageDetailService } from '../../../services/image-detail.service';
import { SearchImageResultDetailComponent } from '../../components/search-image-result-detail/search-image-result-detail.component';
import { SearchHeaderComponent } from '../../components/search-header/search-header.component';
import { MapSearchService } from '../../../services/map-search/map-search.service';
import { SearchAttributesComponent } from '../../components/search-attributes/search-attributes.component';
import { runWithLoading } from '../../../utils/async.utils';
import { SearchAiPreviewComponent } from '../../components/search-ai-preview/search-ai-preview.component';

@Component({
  selector: 'app-search.page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatProgressBarModule,
    SearchImageResultDetailComponent,
    SearchHeaderComponent,
    NgComponentOutlet,
    SearchAttributesComponent,
    SearchAiPreviewComponent,
  ],
  templateUrl: './search.page.html',
  styleUrl: './search.page.scss',
})
export class SearchPage implements OnInit, OnDestroy {
  readonly SearchCategory = SearchCategory;
  private readonly route = inject(ActivatedRoute);
  private readonly searchService = inject(SearchService);
  private readonly mapSearchService = inject(MapSearchService);
  private readonly imageDetailService = inject(ImageDetailService);
  private readonly subscription = new Subscription();
  private readonly router = inject(Router);
  private readonly isBrowser = typeof window !== 'undefined';

  private readonly scrollThreshold = 50;
  private readonly infiniteScrollThreshold = 200;
  private readonly tabComponentCache = new Map<SearchCategory, Type<unknown>>();

  tabs = searchTabs;

  private isLoadingMore = signal<boolean>(false);
  readonly currentTabComponent = signal<Type<unknown> | null>(null);
  activeTab = signal<number>(this.tabs.findIndex((tab) => tab.value === SearchCategory.General));
  showHeaderBackground = signal<boolean>(false);

  isLoading = computed(() => this.searchService.isLoading() || this.mapSearchService.isLoading());
  results = computed(() => this.searchService.results());
  selectedImageResult = computed(() => this.imageDetailService.selectedResult());
  isImageTab = computed(() => this.tabs[this.activeTab()].value === SearchCategory.Images);
  isMapTab = computed(() => this.tabs[this.activeTab()].value === SearchCategory.Map);
  isGeneralTab = computed(() => this.tabs[this.activeTab()].value === SearchCategory.General);

  ngOnInit(): void {
    this.subscription.add(
      this.route.queryParams.subscribe((params) => {
        const queryParam = params['q'];
        const categoryParam = params['category'] as SearchCategory | undefined;

        if (queryParam != null) {
          this.searchService.query.set(queryParam);
        }

        const category = (categoryParam ?? this.tabs[this.activeTab()].value) as SearchCategory;
        this.applyCategoryAndLoadTab(category);

        const query = this.searchService.query().trim();
        if (query) {
          this.runSearchForQuery(
            query,
            this.searchService.category(),
            this.searchService.engines(),
          );
        }
      }),
    );
    if (this.isBrowser) {
      window.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();

    if (this.isBrowser) {
      window.removeEventListener('scroll', this.onScroll.bind(this));
    }
  }

  onTabChange(event: MatTabChangeEvent): void {
    const category = this.tabs[event.index].value as SearchCategory;

    this.router.navigate(['/search'], {
      queryParams: { q: this.searchService.query(), category },
      queryParamsHandling: 'merge',
    });
  }

  onSearch(query: string, category?: SearchCategory, engines?: string[]): void {
    this.router.navigate(['search'], { queryParams: { q: query }, queryParamsHandling: 'merge' });

    this.runSearchForQuery(
      query,
      category ?? this.searchService.category(),
      engines ?? this.searchService.engines(),
    );
  }

  onClear(): void {
    this.router.navigate(['/']);
  }

  private onScroll(): void {
    const scrollY = window.scrollY || window.pageYOffset;
    this.showHeaderBackground.set(scrollY > this.scrollThreshold);

    if (
      this.isLoadingMore() ||
      !this.searchService.hasMorePages() ||
      this.searchService.isLoadingPage()
    ) {
      return;
    }

    const scrollPosition = scrollY + window.innerHeight;
    if (scrollPosition >= document.documentElement.scrollHeight - this.infiniteScrollThreshold) {
      runWithLoading(this.isLoadingMore.set.bind(this.isLoadingMore), () =>
        this.searchService.loadNextPage(),
      );
    }
  }

  onCloseImageDetail(): void {
    this.imageDetailService.close();
  }

  private applyCategoryAndLoadTab(category: SearchCategory): void {
    this.searchService.setCategory(category);
    this.activeTab.set(this.tabs.findIndex((t) => t.value === category));
    this.loadTabComponent(category);
  }

  private runSearchForQuery(query: string, category?: SearchCategory, engines?: string[]): void {
    const cat = category ?? this.searchService.category();
    const eng = engines ?? this.searchService.engines();

    if (cat === SearchCategory.Map) {
      this.mapSearchService.runSearch(query);
    }

    this.searchService.search(query, cat, eng);
  }

  private async loadTabComponent(category: SearchCategory): Promise<void> {
    const cached = this.tabComponentCache.get(category);

    if (cached) {
      this.currentTabComponent.set(cached);

      return;
    }

    const tab = this.tabs.find((t) => t.value === category);
    if (tab?.loader) {
      const componentType = await tab.loader();
      this.tabComponentCache.set(category, componentType);
      this.currentTabComponent.set(componentType);
    }
  }
}
