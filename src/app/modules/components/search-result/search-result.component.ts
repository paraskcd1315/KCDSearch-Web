import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { SearXNGResult } from '../../../types/search.types';

@Component({
  selector: 'app-search-result',
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './search-result.component.html',
  styleUrl: './search-result.component.css',
})
export class SearchResultComponent {
  readonly result = input<SearXNGResult>();
}
