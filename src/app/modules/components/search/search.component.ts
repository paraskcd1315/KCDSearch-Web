import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { SearchService } from '../../../services/search.service';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs';
import { runWithLoading } from '../../../utils/async.utils';

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
  readonly clear = output<void>();

  readonly searchControl = new FormControl(this.initialValue());
  readonly suggestions = signal<string[]>([]);
  readonly isLoadingAutocomplete = signal<boolean>(false);
  readonly isAutocompleteOpen = signal<boolean>(false);

  readonly autocompleteTrigger = viewChild.required<MatAutocompleteTrigger>('autocompleteTrigger');

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
          this.valueChange.emit(value ?? '');
          if (!value || value.trim().length < 2) {
            this.suggestions.set([]);
            this.isAutocompleteOpen.set(false);
          }
        }),
        debounceTime(300),
        distinctUntilChanged(),
        filter((value) => value !== null && value.trim().length >= 2),
        switchMap(async (value) => {
          this.searchService.query.set(value ?? '');
          return runWithLoading(
            this.isLoadingAutocomplete.set.bind(this.isLoadingAutocomplete),
            () => this.searchService.autocomplete(value ?? ''),
          );
        }),
      )
      .subscribe((results) => {
        this.suggestions.set(results);
        const panelStillOpen = this.autocompleteTrigger()?.panelOpen === true;
        this.isAutocompleteOpen.set(panelStillOpen && results.length > 0);
      });
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.suggestions.set([]);
    this.isAutocompleteOpen.set(false);
    this.searchService.clear();
    this.clear.emit();
  }

  onSuggestionClick(suggestion: string): void {
    this.submitWithValue(suggestion);
  }

  onSearch(): void {
    const query = this.searchControl.value?.trim();
    if (query) this.closePanelAndEmitSearch(query);
  }

  onAutocompleteOpened(): void {
    this.isAutocompleteOpen.set(true);
  }

  onAutocompleteClosed(): void {
    this.isAutocompleteOpen.set(false);
  }

  displayFn(value: string): string {
    return value ?? '';
  }

  private submitWithValue(value: string): void {
    this.searchControl.setValue(value, { emitEvent: false });
    const query = value?.trim();
    if (query) this.closePanelAndEmitSearch(query);
  }

  private closePanelAndEmitSearch(query: string): void {
    this.autocompleteTrigger()?.closePanel();
    this.isAutocompleteOpen.set(false);
    this.search.emit(query);
  }
}
