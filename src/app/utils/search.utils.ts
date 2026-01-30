import { SearchCategory } from '../enums/search.enums';
import { SearchTab } from '../types/search.types';

export const searchTabs: SearchTab[] = [
  {
    label: 'AI',
    value: SearchCategory.AI,
    icon: 'heroicons_outline:sparkles',
    loader: async () => (await import('../modules/pages/search/tabs/ai/ai.tab')).AiTab,
  },
  {
    label: 'General',
    value: SearchCategory.General,
    icon: 'heroicons_outline:magnifying-glass',
    loader: async () =>
      (await import('../modules/pages/search/tabs/general/general.tab')).GeneralTab,
  },
  {
    label: 'Images',
    value: SearchCategory.Images,
    icon: 'heroicons_outline:photo',
    loader: async () => (await import('../modules/pages/search/tabs/images/images.tab')).ImagesTab,
  },
  {
    label: 'Videos',
    value: SearchCategory.Videos,
    icon: 'heroicons_outline:video-camera',
    loader: async () =>
      (await import('../modules/pages/search/tabs/general/general.tab')).GeneralTab,
  },
  {
    label: 'News',
    value: SearchCategory.News,
    icon: 'heroicons_outline:newspaper',
    loader: async () =>
      (await import('../modules/pages/search/tabs/general/general.tab')).GeneralTab,
  },
  {
    label: 'Map',
    value: SearchCategory.Map,
    icon: 'heroicons_outline:map',
    loader: async () => (await import('../modules/pages/search/tabs/map/map.tab')).MapTab,
  },
  {
    label: 'Music',
    value: SearchCategory.Music,
    icon: 'heroicons_outline:musical-note',
    loader: async () =>
      (await import('../modules/pages/search/tabs/general/general.tab')).GeneralTab,
  },
  {
    label: 'Science',
    value: SearchCategory.Science,
    icon: 'heroicons_outline:academic-cap',
    loader: async () =>
      (await import('../modules/pages/search/tabs/general/general.tab')).GeneralTab,
  },
];

export const SPEED_TEST_QUERIES: readonly string[] = [
  // English
  'speed test',
  'speedtest',
  'internet speed test',
  'broadband speed test',
  'test my internet speed',
  'check internet speed',
  'wifi speed test',
  'network speed test',
  'connection speed test',
  'how fast is my internet',
  'test speed',
  'speed check',
  // Spanish
  'test de velocidad',
  'prueba de velocidad',
  'velocidad de internet',
  'test velocidad internet',
  'medir velocidad internet',
  'velocidad wifi',
  'velocidad de conexión',
  'test de velocidad internet',
  'prueba velocidad',
  'velocidad internet',
  'medir velocidad',
];

export function isSpeedTestQuery(query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return false;
  return SPEED_TEST_QUERIES.some((phrase) => normalized === phrase || normalized.includes(phrase));
}
