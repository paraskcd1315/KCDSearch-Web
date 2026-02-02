import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import {
  PerplexicaSearchRequest,
  PerplexicaSource,
  PerplexicaStreamEvent,
} from '../types/perplexica.types';
import { Observable } from 'rxjs';
import { AI_API_URL } from '../utils/constants.utils';
import { AppConfigService } from './app-config/app-config.service';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(AppConfigService);
  readonly lastSources = signal<PerplexicaSource[]>([]);

  setLastSources(sources: PerplexicaSource[]): void {
    this.lastSources.set(sources);
  }

  search(
    request: Omit<PerplexicaSearchRequest, 'stream' | 'chatModel' | 'embeddingModel' | 'sources'>,
  ): Observable<PerplexicaStreamEvent> {
    return new Observable((subscriber) => {
      const ac = new AbortController();

      fetch(`${AI_API_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...request,
          stream: true,
          chatModel: {
            providerId: this.appConfig.config.aiProviderId,
            key: this.appConfig.config.aiProviderKey,
          },
          embeddingModel: {
            providerId: this.appConfig.config.aiProviderEmbedId,
            key: this.appConfig.config.aiProviderEmbedKey,
          },
          sources: ['web', 'academic', 'discussions'],
        }),
        signal: ac.signal,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Search failed: ${response.status}`);
          }

          return response.body as ReadableStream<Uint8Array>;
        })
        .then((body: ReadableStream<Uint8Array>) => {
          const reader = body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          const process = (): Promise<void> =>
            reader.read().then(({ done, value }) => {
              if (done) {
                subscriber.complete();

                return;
              }
              buffer += decoder.decode(value, { stream: true });

              const lines = buffer.split('\n');
              buffer = lines.pop() ?? '';

              for (const line of lines) {
                const trimmed = line.trim();

                if (!trimmed) {
                  continue;
                }

                try {
                  const event = JSON.parse(trimmed) as PerplexicaStreamEvent;
                  subscriber.next(event);
                } catch {}
              }

              return process();
            });
          return process();
        })
        .catch((err) => subscriber.error(err));

      return () => ac.abort();
    });
  }
}
