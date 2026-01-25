import { CommonModule } from '@angular/common';
import { Component, inject, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { SearchComponent } from '../../components/search/search.component';
import { SearchService } from '../../../services/search/search.service';

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
})
export class HomePage {
  private readonly searchService = inject(SearchService);
  private readonly router = inject(Router);

  async onSearch(query: string): Promise<void> {
    this.router.navigate(['search'], { queryParams: { q: query } });
    await this.searchService.search(query);
  }
}