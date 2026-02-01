import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SearchService } from '../../../services/search.service';
import { SAFE_SEARCH_SELECT_OPTIONS } from '../../../utils/constants.utils';
import { FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-search-attributes',
  imports: [CommonModule, MatSlideToggleModule, MatFormFieldModule, MatSelectModule, FormField],
  templateUrl: './search-attributes.component.html',
  styleUrl: './search-attributes.component.css',
})
export class SearchAttributesComponent {
  private readonly searchService = inject(SearchService);
  readonly searchForm = this.searchService.searchForm;
  readonly safeSearchSelectOptions = SAFE_SEARCH_SELECT_OPTIONS;

  refreshSearch(): void {
    this.searchService.refreshSearch();
  }
}
