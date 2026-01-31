import { Injectable } from '@angular/core';
import {
  DB_MAP_NAME,
  DB_MAP_VERSION,
  STORE_NOMINATIM,
  STORE_OVERPASS,
  NOMINATIM_TTL_MS,
  OVERPASS_TTL_MS,
} from '../../utils/constants.utils';
import { CacheEntry } from '../../types/cache.types';

@Injectable({
  providedIn: 'root',
})
export class MapCacheService {
  private db: IDBDatabase | null = null;

  private async openDb(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_MAP_NAME, DB_MAP_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NOMINATIM)) {
          db.createObjectStore(STORE_NOMINATIM, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(STORE_OVERPASS)) {
          db.createObjectStore(STORE_OVERPASS, { keyPath: 'key' });
        }
      };
    });
  }

  async getNominatim(query: string): Promise<unknown | null> {
    const db = await this.openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NOMINATIM, 'readonly');
      const store = tx.objectStore(STORE_NOMINATIM);
      const key = query.trim().toLowerCase();
      const req = store.get(key);
      req.onsuccess = () => {
        const entry = req.result as CacheEntry<unknown> | undefined;
        if (!entry || entry.expires < Date.now()) resolve(null);
        else resolve(entry.value);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async setNominatim(query: string, value: unknown): Promise<void> {
    const db = await this.openDb();
    const key = query.trim().toLowerCase();
    const entry: CacheEntry<unknown> = { value, expires: Date.now() + NOMINATIM_TTL_MS };
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NOMINATIM, 'readwrite');
      tx.objectStore(STORE_NOMINATIM).put({ key, ...entry });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getOverpass(cacheKey: string): Promise<unknown | null> {
    const db = await this.openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_OVERPASS, 'readonly');
      const req = tx.objectStore(STORE_OVERPASS).get(cacheKey);
      req.onsuccess = () => {
        const entry = req.result as CacheEntry<unknown> | undefined;
        if (!entry || entry.expires < Date.now()) resolve(null);
        else resolve(entry.value);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async setOverpass(cacheKey: string, value: unknown): Promise<void> {
    const db = await this.openDb();
    const entry: CacheEntry<unknown> = { value, expires: Date.now() + OVERPASS_TTL_MS };
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_OVERPASS, 'readwrite');
      tx.objectStore(STORE_OVERPASS).put({ key: cacheKey, ...entry });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}
