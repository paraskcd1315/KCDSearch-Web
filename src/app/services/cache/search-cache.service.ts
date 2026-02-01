import { Injectable } from '@angular/core';
import {
  DB_SEARCH_NAME,
  DB_SEARCH_VERSION,
  SEARXNG_TTL_MS,
  STORE_SEARXNG,
} from '../../utils/constants.utils';
import { SearchCategory } from '../../enums/search.enums';
import { SearXNGResponse } from '../../types/search.types';
import { CacheEntry } from '../../types/cache.types';

@Injectable({
  providedIn: 'root',
})
export class SearchCacheService {
  private db: IDBDatabase | null = null;

  private async openDb(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_SEARCH_NAME, DB_SEARCH_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_SEARXNG)) {
          db.createObjectStore(STORE_SEARXNG, { keyPath: 'key' });
        }
      };
    });
  }

  buildCacheKey(
    query: string,
    category: SearchCategory,
    page: number,
    engines: string[],
    language?: string,
    safeSearch?: number,
  ): string {
    const q = query.trim().toLowerCase();
    const eng = [...engines].sort().join(',');
    const lang = language ?? '';
    return `${q}|${category}|${page}|${eng}|${lang}|${safeSearch}`;
  }

  async get(key: string): Promise<SearXNGResponse | null> {
    const db = await this.openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SEARXNG, 'readonly');
      const req = tx.objectStore(STORE_SEARXNG).get(key);
      req.onsuccess = () => {
        const entry = req.result as CacheEntry<SearXNGResponse> | undefined;
        if (!entry || entry.expires < Date.now()) resolve(null);
        else resolve(entry.value);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async set(key: string, value: SearXNGResponse): Promise<void> {
    const db = await this.openDb();
    const entry: CacheEntry<SearXNGResponse> = {
      value,
      expires: Date.now() + SEARXNG_TTL_MS,
    };
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SEARXNG, 'readwrite');
      tx.objectStore(STORE_SEARXNG).put({ key, ...entry });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}
