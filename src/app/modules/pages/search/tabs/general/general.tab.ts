import { Component, inject } from '@angular/core';
import { SearchService } from '../../../../../services/search/search.service';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-general-tab',
  imports: [
    MatCardModule
  ],
  templateUrl: './general.tab.html',
  styleUrl: './general.tab.css',
})
export class GeneralTab {
  private readonly searchService = inject(SearchService);
  readonly results = this.searchService.results;
}