import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { SearchService } from '../../../services/search.service';
import { AiService } from '../../../services/ai.service';
import { AppConfigService } from '../../../services/app-config/app-config.service';
import { PerplexicaSearchRequest, PerplexicaSource } from '../../../types/perplexica.types';
import { MIN_AI_QUERY_WORDS } from '../../../utils/constants.utils';
import { PerplexicaOptimizationMode } from '../../../enums/perplexica.enums';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MarkdownPipe } from '../../../pipes/markdown.pipe';
import { SearchAiSourcesComponent } from '../search-ai-sources/search-ai-sources.component';

@Component({
  selector: 'app-search-ai-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatExpansionModule, MarkdownPipe, SearchAiSourcesComponent],
  templateUrl: './search-ai-preview.component.html',
  styleUrl: './search-ai-preview.component.css',
})
export class SearchAiPreviewComponent {
  private readonly searchService = inject(SearchService);
  private readonly aiService = inject(AiService);
  private readonly appConfig = inject(AppConfigService);
  private readonly destroyRef = inject(DestroyRef);

  readonly query = this.searchService.query;
  readonly loading = signal(false);
  readonly message = signal('');
  readonly sources = signal<PerplexicaSource[]>([]);
  readonly error = signal<string | null>(null);
  lastSources = this.aiService.lastSources;

  private readonly hasAiConfig = computed(() => {
    const c = this.appConfig.config;

    return !!(c.aiProviderId && c.aiProviderKey && c.aiProviderEmbedId && c.aiProviderEmbedKey);
  });

  readonly shouldRun = computed(() => {
    const q = this.query().trim();
    const words = q.split(/\s+/).filter(Boolean);

    return words.length >= MIN_AI_QUERY_WORDS && this.hasAiConfig();
  });

  constructor() {
    effect(
      () => {
        const q = this.query().trim();

        if (!this.shouldRun()) {
          return;
        }

        this.runSearch(q);
      },
      { allowSignalWrites: true },
    );
  }

  private runSearch(query: string) {
    this.loading.set(true);
    this.error.set(null);
    this.message.set('');
    this.sources.set([]);

    const request: Omit<
      PerplexicaSearchRequest,
      'stream' | 'chatModel' | 'embeddingModel' | 'sources'
    > = {
      query,
      history: [],
      optimizationMode: PerplexicaOptimizationMode.Speed,
      systemInstructions:
        'You are a helpful assistant that can answer questions search the internet for information and provide the most relevant and accurate information.',
    };

    this.aiService
      .search(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (event) => {
          switch (event.type) {
            case 'response':
              this.message.update((m) => m + (event.data ?? ''));
              break;
            case 'sources':
              this.sources.set(event.data ?? []);
              this.aiService.setLastSources(event.data ?? []);
              break;
            case 'done':
              this.loading.set(false);
              break;
          }
        },
        error: (err) => {
          this.error.set(err?.message ?? 'Search failed');
          this.loading.set(false);
        },
      });
  }
}
