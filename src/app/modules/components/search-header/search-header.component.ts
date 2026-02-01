import { CommonModule } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import { SearchComponent } from '../search/search.component';
import { RouterLink } from '@angular/router';
import { SearchService } from '../../../services/search.service';

@Component({
  selector: 'app-search-header',
  imports: [CommonModule, SearchComponent, RouterLink],
  templateUrl: './search-header.component.html',
  styleUrl: './search-header.component.css',
})
export class SearchHeaderComponent {
  private readonly searchService = inject(SearchService);
  readonly query = this.searchService.query;
  onSearchEvent = output<string>({ alias: 'onSearch' });
  onClearEvent = output<void>({ alias: 'onClear' });

  onSearch(query: string): void {
    this.onSearchEvent.emit(query);
  }

  onClear(): void {
    this.onClearEvent.emit();
  }
}
