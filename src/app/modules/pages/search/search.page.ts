import { CommonModule, NgComponentOutlet } from '@angular/common';
import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
  Type,
  ViewEncapsulation,
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
import { FormField } from '@angular/forms/signals';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { SAFE_SEARCH_SELECT_OPTIONS } from '../../../utils/constants.utils';

@Component({
  selector: 'app-search.page',
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatProgressBarModule,
    SearchImageResultDetailComponent,
    SearchHeaderComponent,
    NgComponentOutlet,
    MatSlideToggleModule,
    FormField,
    MatSelectModule,
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
  private readonly scrollThreshold = 50;
  private readonly infiniteScrollThreshold = 200;
  private readonly tabComponentCache = new Map<SearchCategory, Type<unknown>>();
  readonly searchForm = this.searchService.searchForm;
  readonly currentTabComponent = signal<Type<unknown> | null>(null);
  readonly safeSearchSelectOptions = SAFE_SEARCH_SELECT_OPTIONS;

  tabs = searchTabs;

  private isLoadingMore = signal<boolean>(false);
  activeTab = signal<number>(this.tabs.findIndex((tab) => tab.value === SearchCategory.General));
  showHeaderBackground = signal<boolean>(false);

  isLoading = computed(() => this.searchService.isLoading());
  isMapLoading = computed(() => this.mapSearchService.isLoading());
  results = computed(() => this.searchService.results());
  selectedImageResult = computed(() => this.imageDetailService.selectedResult());
  isImageTab = computed(() => this.tabs[this.activeTab()].value === SearchCategory.Images);
  isMapTab = computed(() => this.tabs[this.activeTab()].value === SearchCategory.Map);

  ngOnInit(): void {
    this.subscription.add(
      this.route.queryParams.subscribe((params) => {
        const queryParam = params['q'];
        const categoryParam = params['category'] as SearchCategory | undefined;

        if (queryParam != null) {
          this.searchService.query.set(queryParam);
        }

        if (categoryParam != null) {
          this.searchService.setCategory(categoryParam);
          this.activeTab.set(this.tabs.findIndex((tab) => tab.value === categoryParam));
          this.loadTabComponent(categoryParam);
        } else {
          this.searchService.setCategory(this.tabs[this.activeTab()].value);
          this.loadTabComponent(this.tabs[this.activeTab()].value as SearchCategory);
        }

        const query = this.searchService.query().trim();
        if (query) {
          const category = this.searchService.category();
          if (category === SearchCategory.Map) {
            this.mapSearchService.runSearch(query);
            this.searchService.search(query, SearchCategory.Map, this.searchService.engines());
          } else {
            this.searchService.search(
              query,
              this.searchService.category(),
              this.searchService.engines(),
            );
          }
        }
      }),
    );

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.onScroll.bind(this));
    }
  }

  onTabChange(event: MatTabChangeEvent): void {
    const category = this.tabs[event.index].value as SearchCategory;
    const query = this.searchService.query();

    this.router.navigate(['/search'], {
      queryParams: {
        q: query,
        category,
      },
      queryParamsHandling: 'merge',
    });
  }

  onSearch(query: string, category?: SearchCategory, engines?: string[]): void {
    this.router.navigate(['search'], { queryParams: { q: query }, queryParamsHandling: 'merge' });
    const cat = category ?? this.searchService.category();
    if (cat === SearchCategory.Map) {
      this.searchService.query.set(query);
      this.searchService.setCategory(SearchCategory.Map);
      this.mapSearchService.runSearch(query);
      this.searchService.search(query, SearchCategory.Map, engines ?? this.searchService.engines());
    } else {
      this.searchService.search(query, cat, engines ?? this.searchService.engines());
    }
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

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollPosition = scrollY + windowHeight;

    if (scrollPosition >= documentHeight - this.infiniteScrollThreshold) {
      this.isLoadingMore.set(true);
      this.searchService.loadNextPage().finally(() => {
        this.isLoadingMore.set(false);
      });
    }
  }

  onCloseImageDetail(): void {
    this.imageDetailService.close();
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

  refreshSearch(): void {
    this.searchService.refreshSearch();
  }
}
