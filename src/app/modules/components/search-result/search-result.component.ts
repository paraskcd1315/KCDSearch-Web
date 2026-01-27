import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { SearXNGResult } from '../../../types/search.types';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-search-result',
  imports: [
    CommonModule,
    MatCardModule,
    DatePipe,
    MatTooltipModule
  ],
  templateUrl: './search-result.component.html',
  styleUrl: './search-result.component.css',
})
export class SearchResultComponent {
  readonly result = input<SearXNGResult>();
  readonly sanitizer = inject(DomSanitizer);

  getSafeIframeSrc(url?: string): SafeResourceUrl | null {
    if (!url) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
