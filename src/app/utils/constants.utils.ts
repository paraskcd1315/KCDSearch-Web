import { SafeSearch } from '../enums/search.enums';
import { SelectOption } from '../types/config.types';
import { SearchAttributes, SearXNGResponse } from '../types/search.types';

export const DB_SEARCH_NAME = 'kcdsearch-search-cache';
export const DB_SEARCH_VERSION = 1;
export const STORE_SEARXNG = 'searxng';
export const SEARXNG_TTL_MS = 60 * 60 * 1000;

export const DB_MAP_NAME = 'kcdsearch-map-cache';
export const DB_MAP_VERSION = 1;
export const STORE_FOURSQUARE = 'foursquare';
export const FOURSQUARE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
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

export const COUNTRY_TO_LANG: Record<string, string> = {
  ES: 'es',
  FR: 'fr',
  DE: 'de',
  IT: 'it',
  PT: 'pt',
  GB: 'en',
  US: 'en',
  NL: 'nl',
  PL: 'pl',
  RU: 'ru',
  JP: 'ja',
  CN: 'zh',
  KR: 'ko',
  IN: 'hi',
  BR: 'pt',
  MX: 'es',
  AR: 'es',
  CO: 'es',
  CL: 'es',
  PE: 'es',
  TR: 'tr',
  GR: 'el',
  CZ: 'cs',
  RO: 'ro',
  HU: 'hu',
  SE: 'sv',
  NO: 'no',
  DK: 'da',
  FI: 'fi',
  IE: 'en',
  AT: 'de',
  CH: 'de',
  BE: 'nl',
  CA: 'en',
  AU: 'en',
};

export const SAFE_SEARCH_TO_SEARXNG: Record<SafeSearch, number> = {
  Off: 0,
  Moderate: 1,
  Strict: 2,
};

export const SAFE_SEARCH_SELECT_OPTIONS: SelectOption[] = [
  { label: 'Off', value: SafeSearch.Off },
  { label: 'Moderate', value: SafeSearch.Moderate },
  { label: 'Strict', value: SafeSearch.Strict },
];

export const DEFAULT_POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000,
};

export const REVERSE_GEOCODING_API_URL = 'https://nominatim.openstreetmap.org/reverse';

export const DEFAULT_SEARCH_MODEL: SearchAttributes = {
  useLocale: true,
  safeSearch: SafeSearch.Off,
};

export const GEO_LOCATION_PRECISION = 4;

export const AI_API_URL = '/api/ai';
export const AUTOCOMPLETE_API_URL = '/api/autocomplete';
export const SEARCH_API_URL = '/api/search';

export const MIN_AI_QUERY_WORDS = 5;

export const INITIAL_SOURCES = 3;
