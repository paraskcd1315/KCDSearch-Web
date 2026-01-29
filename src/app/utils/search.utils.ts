import { SearchCategory } from '../enums/search.enums';
import { SearchTab } from '../types/search.types';

export const searchTabs: SearchTab[] = [
  {
    label: 'AI',
    value: SearchCategory.AI,
    icon: 'heroicons_outline:sparkles',
    loader: () => import('../modules/pages/search/tabs/ai/ai.tab').then((m) => m.AiTab),
  },
  {
    label: 'General',
    value: SearchCategory.General,
    icon: 'heroicons_outline:magnifying-glass',
    loader: () =>
      import('../modules/pages/search/tabs/general/general.tab').then((m) => m.GeneralTab),
  },
  {
    label: 'Images',
    value: SearchCategory.Images,
    icon: 'heroicons_outline:photo',
    loader: () => import('../modules/pages/search/tabs/images/images.tab').then((m) => m.ImagesTab),
  },
  {
    label: 'Videos',
    value: SearchCategory.Videos,
    icon: 'heroicons_outline:video-camera',
    loader: () =>
      import('../modules/pages/search/tabs/general/general.tab').then((m) => m.GeneralTab),
  },
  {
    label: 'News',
    value: SearchCategory.News,
    icon: 'heroicons_outline:newspaper',
    loader: () =>
      import('../modules/pages/search/tabs/general/general.tab').then((m) => m.GeneralTab),
  },
  {
    label: 'Map',
    value: SearchCategory.Map,
    icon: 'heroicons_outline:map',
    loader: () => import('../modules/pages/search/tabs/map/map.tab').then((m) => m.MapTab),
  },
  {
    label: 'Music',
    value: SearchCategory.Music,
    icon: 'heroicons_outline:musical-note',
    loader: () =>
      import('../modules/pages/search/tabs/general/general.tab').then((m) => m.GeneralTab),
  },
  {
    label: 'Science',
    value: SearchCategory.Science,
    icon: 'heroicons_outline:academic-cap',
    loader: () =>
      import('../modules/pages/search/tabs/general/general.tab').then((m) => m.GeneralTab),
  },
];
