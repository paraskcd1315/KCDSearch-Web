import { PerplexicaOptimizationMode } from '../enums/perplexica.enums';

export interface PerplexicaModel {
  providerId: string;
  key: string;
}

export interface PerplexicaSearchRequest {
  chatModel: PerplexicaModel;
  embeddingModel: PerplexicaModel;
  optimizationMode: PerplexicaOptimizationMode;
  query: string;
  sources: string[];
  history: [string, string][];
  stream: boolean;
  systemInstructions: string;
}

export interface PerplexicaSource {
  content: string;
  metadata: PerplexicaSourceMetadata;
}

export interface PerplexicaSourceMetadata {
  title: string;
  url: string;
}

export type PerplexicaStreamEvent =
  | { type: 'init'; data?: string }
  | { type: 'sources'; data: PerplexicaSource[] }
  | { type: 'response'; data: string }
  | { type: 'done' };
