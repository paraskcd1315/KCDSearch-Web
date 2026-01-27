import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
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
    ImagesTab
  ],
  templateUrl: './search.page.html',
  styleUrl: './search.page.scss',
})
export class SearchPage implements OnInit, OnDestroy {
  readonly SearchCategory = SearchCategory;
  private readonly route = inject(ActivatedRoute);
  private readonly searchService = inject(SearchService);
  private readonly subscription = new Subscription();
  private readonly router = inject(Router);
  private readonly scrollThreshold = 50;
  private readonly infiniteScrollThreshold = 200;
  
  tabs = searchTabs;
  private isLoadingMore = signal<boolean>(false);
  activeTab = signal<number>(this.tabs.findIndex(tab => tab.value === SearchCategory.General));
  showHeaderBackground = signal<boolean>(false);

  query = computed(() => this.searchService.query());
  isLoading = computed(() => this.searchService.isLoading());
  results = computed(() => this.searchService.results());

  ngOnInit(): void {
    this.subscription.add(this.route.queryParams.subscribe((params) => {
      const queryParam = params['q'];
      const categoryParam = params['category'];
      if (queryParam && !this.searchService.query().trim()) {
        this.searchService.query.set(queryParam);
        if (categoryParam) {
          this.searchService.setCategory(categoryParam as SearchCategory);
          this.activeTab.set(this.tabs.findIndex(tab => tab.value === categoryParam));
        } else {
          this.searchService.setCategory(this.tabs[this.activeTab()].value);
        }
        this.searchService.search(queryParam, this.searchService.category(), this.searchService.engines());
      }
    }))

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
    this.router.navigate(['/search'], { queryParams: { category: this.tabs[event.index].value }, queryParamsHandling: 'merge' });
    this.onSearch(this.searchService.query(), this.tabs[event.index].value as SearchCategory, this.searchService.engines());
  }

  onSearch(query: string, category?: SearchCategory, engines?: string[]): void {
    this.router.navigate(['search'], { queryParams: { q: query }, queryParamsHandling: 'merge' });
    this.searchService.search(query, category ?? this.searchService.category(), engines ?? this.searchService.engines());
  }

  onClear(): void {
    this.router.navigate(['/']);
  }

  private onScroll(): void {
    const scrollY = window.scrollY || window.pageYOffset;
    this.showHeaderBackground.set(scrollY > this.scrollThreshold);

    if (this.isLoadingMore() || !this.searchService.hasMorePages() || this.searchService.isLoadingPage()) {
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
}
