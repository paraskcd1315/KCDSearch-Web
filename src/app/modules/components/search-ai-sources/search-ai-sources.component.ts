import { Component, computed, inject } from '@angular/core';
import { AiService } from '../../../services/ai.service';
import { INITIAL_SOURCES } from '../../../utils/constants.utils';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-search-ai-sources',
  imports: [MatCardModule, MatExpansionModule],
  templateUrl: './search-ai-sources.component.html',
  styleUrl: './search-ai-sources.component.css',
})
export class SearchAiSourcesComponent {
  private readonly aiService = inject(AiService);
  readonly sources = this.aiService.lastSources;
  readonly initialSources = computed(() => this.sources().slice(0, INITIAL_SOURCES));
  readonly moreSources = computed(() => this.sources().slice(INITIAL_SOURCES));
  readonly hasMore = computed(() => this.sources().length > INITIAL_SOURCES);
  readonly moreCount = computed(() => this.moreSources().length);
}
