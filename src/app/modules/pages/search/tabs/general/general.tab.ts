import { Component, inject } from '@angular/core';
import { SearchService } from '../../../../../services/search/search.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { SearchResultComponent } from '../../../../components/search-result/search-result.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-general-tab',
  imports: [
    SearchResultComponent,
    MatExpansionModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './general.tab.html',
  styleUrl: './general.tab.css',
})
export class GeneralTab {
  private readonly searchService = inject(SearchService);
  readonly results = this.searchService.results;
  readonly information = this.searchService.information;
  readonly isLoadingPage = this.searchService.isLoadingPage;
  readonly hasMorePages = this.searchService.hasMorePages;
}