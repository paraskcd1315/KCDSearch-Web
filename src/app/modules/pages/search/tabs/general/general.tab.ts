import { Component, inject } from '@angular/core';
import { SearchService } from '../../../../../services/search/search.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { SearchResultComponent } from '../../../../components/search-result/search-result.component';

@Component({
  selector: 'app-general-tab',
  imports: [
    SearchResultComponent,
    MatExpansionModule
  ],
  templateUrl: './general.tab.html',
  styleUrl: './general.tab.css',
})
export class GeneralTab {
  private readonly searchService = inject(SearchService);
  readonly results = this.searchService.results;
  readonly information = this.searchService.information;
}