import { Component, effect, inject, input, output, signal, ViewEncapsulation } from '@angular/core';
import { SearchService } from '../../../services/search/search.service';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-search',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class SearchComponent {
  private readonly searchService = inject(SearchService);

  readonly placeholder = input<string>('Search the web...');
  readonly initialValue = input<string>('');

  readonly search = output<string>();
  readonly valueChange = output<string>();

  readonly searchControl = new FormControl(this.initialValue());
  readonly suggestions = signal<string[]>([]);
  readonly isLoadingAutocomplete = signal<boolean>(false);
  readonly isAutocompleteOpen = signal<boolean>(false);

  constructor() {
    effect(() => {
      const value = this.initialValue();
      if (value !== this.searchControl.value) {
        this.searchControl.setValue(value, { emitEvent: false });
      }
    });

    this.searchControl.valueChanges
      .pipe(
        tap((value) => {
          if (!value || value.trim().length < 2) {
            this.suggestions.set([]);
            this.isAutocompleteOpen.set(false);
          }
        }),
        debounceTime(300),
        distinctUntilChanged(),
        filter((value) => value !== null && value.trim().length >= 2),
        switchMap(async (value) => {
          this.isLoadingAutocomplete.set(true);
          const results = await this.searchService.autocomplete(value || '');
          this.isLoadingAutocomplete.set(false);
          return results;
        })
      )
      .subscribe((results) => {
        this.suggestions.set(results);
        this.isAutocompleteOpen.set(results.length > 0);
      });

    this.searchControl.valueChanges.subscribe((value) => {
      this.valueChange.emit(value || '');
    });
  }

  onSearch(): void {
    const query = this.searchControl.value?.trim();
    if (query) {
      this.search.emit(query);
    }
  }

  onOptionSelected(value: string): void {
    this.searchControl.setValue(value, { emitEvent: false });
    this.onSearch();
  }

  onAutocompleteOpened(): void {
    this.isAutocompleteOpen.set(true);
  }

  onAutocompleteClosed(): void {
    this.isAutocompleteOpen.set(false);
  }

  displayFn(value: string): string {
    return value || '';
  }
}
