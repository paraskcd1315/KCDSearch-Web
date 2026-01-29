import { CommonModule, NgComponentOutlet } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal, Type } from '@angular/core';
import { SearchComponent } from '../../components/search/search.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SearchService } from '../../../services/search/search.service';
import { Subscription } from 'rxjs';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { searchTabs } from '../../../utils/search.utils';
import { SearchCategory } from '../../../enums/search.enums';
import { AiTab } from './tabs/ai/ai.tab';
import { GeneralTab } from './tabs/general/general.tab';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ImagesTab } from './tabs/images/images.tab';
import { ImageDetailService } from '../../../services/image-detail/image-detail.service';
import { SearchImageResultDetailComponent } from '../../components/search-image-result-detail/search-image-result-detail.component';
import { SearchHeaderComponent } from '../../components/search-header/search-header.component';

@Component({
  selector: 'app-search.page',
  imports: [
    CommonModule,
    SearchComponent,
    RouterLink,
    MatTabsModule,
    MatIconModule,
    AiTab,
    GeneralTab,
    MatProgressBarModule,
    ImagesTab,
    SearchImageResultDetailComponent,
    SearchHeaderComponent,
    NgComponentOutlet,
  ],
  templateUrl: './search.page.html',
  styleUrl: './search.page.scss',
})
export class SearchPage implements OnInit, OnDestroy {
  readonly SearchCategory = SearchCategory;
  private readonly route = inject(ActivatedRoute);
  private readonly searchService = inject(SearchService);
  private readonly imageDetailService = inject(ImageDetailService);
  private readonly subscription = new Subscription();
  private readonly router = inject(Router);
  private readonly scrollThreshold = 50;
  private readonly infiniteScrollThreshold = 200;
  private readonly tabComponentCache = new Map<SearchCategory, Type<unknown>>();
  readonly currentTabComponent = signal<Type<unknown> | null>(null);

  tabs = searchTabs;

  private isLoadingMore = signal<boolean>(false);
  activeTab = signal<number>(this.tabs.findIndex((tab) => tab.value === SearchCategory.General));
  showHeaderBackground = signal<boolean>(false);

  isLoading = computed(() => this.searchService.isLoading());
  results = computed(() => this.searchService.results());
  selectedImageResult = computed(() => this.imageDetailService.selectedResult());
  isImageTab = computed(() => this.tabs[this.activeTab()].value === SearchCategory.Images);

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
          this.searchService.search(
            query,
            this.searchService.category(),
            this.searchService.engines(),
          );
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
    this.searchService.search(
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

  private loadTabComponent(category: SearchCategory): void {
    const cached = this.tabComponentCache.get(category);
    if (cached) {
      this.currentTabComponent.set(cached);
      return;
    }
    const tab = this.tabs.find((t) => t.value === category);
    if (tab?.loader) {
      tab.loader().then((componentType: Type<unknown>) => {
        this.tabComponentCache.set(category, componentType);
        this.currentTabComponent.set(componentType);
      });
    }
  }
}
