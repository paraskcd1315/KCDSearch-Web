import { SafeSearch, SearchCategory } from '../enums/search.enums';

export interface SearchAttributes {
  useLocale: boolean;
  safeSearch: SafeSearch;
}

export interface SearXNGResult {
  url: string;
  title: string;
  thumbnail?: string;
  thumbnail_src?: string;
  template?: string;
  score?: number;
  content: string;
  engine: string;
  parsed_url?: string[];
  img_src?: string | string[];
  publishedDate?: string | null;
  positions?: number[];
  engines?: string[];
  priority?: string;
  category?: string;
  iframe_src?: string;
  resolution?: string;
  img_format?: string;
  filesize?: string;
  latitude?: number;
  longitude?: number;
  boundingbox?: number[];
  geojson?: { type: string; coordinates: number[] };
  address?: {
    name?: string;
    house_number?: string | null;
    road?: string;
    locality?: string;
    postcode?: string;
    country?: string;
  };
  osm?: { type: string; id: number };
}

export interface InfoboxImage {
  src: string;
  alt: string;
  title: string;
  width: number;
  height: number;
  type: string;
  themes: string;
  colorinvertable: boolean;
  contenttype: string;
}

export interface InfoboxAttribute {
  label: string;
  value?: string;
  image?: InfoboxImage;
}

export interface InfoboxUrl {
  title: string;
  url: string;
}

export interface Infobox {
  infobox: string;
  attributes: InfoboxAttribute[];
  urls?: InfoboxUrl[];
  engine: string;
  url: string | null;
  template: string;
  parsed_url: string[] | null;
  title: string;
  content: string;
  img_src: string;
  thumbnail: string;
  priority: string;
  engines: string[];
  positions: string;
  score: number;
  category: string;
  publishedDate: string | null;
}

export interface SearXNGResponse {
  query: string;
  number_of_results: number;
  results: SearXNGResult[];
  answers?: string[];
  corrections?: string[];
  infoboxes?: Infobox[];
  suggestions?: string[];
  unresponsive_engines?: string[];
}

export interface SearchState {
  query: string;
  results: SearXNGResult[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
}

export interface SearchTab {
  label: string;
  value: SearchCategory;
  icon: string;
  loader: () => Promise<any>;
}
