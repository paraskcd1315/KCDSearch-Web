import { CommonModule } from '@angular/common';
import { Component, inject, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { SearchService } from '../../../services/search/search.service';
import { SearchComponent } from '../../components/search/search.component';

@Component({
  selector: 'app-home.page',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    SearchComponent
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css',
  encapsulation: ViewEncapsulation.None,
})
export class HomePage {
  private readonly searchService = inject(SearchService);
  private readonly router = inject(Router);

  onSearch(query: string): void {
    this.searchService.search(query).then(() => {
      this.router.navigate(['/search']);
    });
  }
}