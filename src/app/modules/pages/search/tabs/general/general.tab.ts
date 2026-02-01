import { Component, computed, inject } from '@angular/core';
import { SearchService } from '../../../../../services/search.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { SearchResultComponent } from '../../../../components/search-result/search-result.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { isSpeedTestQuery } from '../../../../../utils/search.utils';
import { DomSanitizer } from '@angular/platform-browser';
import { SearchCategory } from '../../../../../enums/search.enums';

@Component({
  selector: 'app-general-tab',
  imports: [SearchResultComponent, MatExpansionModule, MatProgressSpinnerModule],
  templateUrl: './general.tab.html',
  styleUrl: './general.tab.css',
})
export class GeneralTab {
  private readonly searchService = inject(SearchService);
  private readonly sanitizer = inject(DomSanitizer);
  readonly category = this.searchService.category;
  readonly results = this.searchService.results;
  readonly information = this.searchService.information;
  readonly isLoadingPage = this.searchService.isLoadingPage;
  readonly hasMorePages = this.searchService.hasMorePages;

  readonly showSpeedTestEmbed = computed(
    () =>
      isSpeedTestQuery(this.searchService.query()) && this.category() === SearchCategory.General,
  );
  readonly speedTestIframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl('/speedtest/');
}
