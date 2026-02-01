import { SearXNGResponse } from '../types/search.types';

export const DB_MAP_NAME = 'kcdsearch-map-cache';
export const DB_MAP_VERSION = 1;
export const STORE_FOURSQUARE = 'foursquare';
export const FOURSQUARE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const DB_SEARCH_NAME = 'kcdsearch-search-cache';
export const DB_SEARCH_VERSION = 1;
export const STORE_SEARXNG = 'searxng';
export const SEARXNG_TTL_MS = 60 * 60 * 1000;
export const FOURSQUARE_API_URL = '/api/places';
export const FOURSQUARE_API_URL_SEARCH = '/api/places/search';
export const FOURSQUARE_API_URL_DETAILS = (id: string) => `${FOURSQUARE_API_URL}/${id}`;
export const EMPTY_SEARCH_RESPONSE: SearXNGResponse = {
  query: '',
  number_of_results: 0,
  results: [],
  answers: [],
  corrections: [],
  infoboxes: [],
  suggestions: [],
  unresponsive_engines: [],
};
