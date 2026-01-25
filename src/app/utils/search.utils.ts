import { SearchCategory } from "../enums/search.enums";
import { SearchTab } from "../types/search.types";

export const searchTabs: SearchTab[] = [
  { label: 'AI', value: SearchCategory.AI, icon: 'heroicons_outline:sparkles' },
  { label: 'General', value: SearchCategory.General, icon: 'heroicons_outline:magnifying-glass' },
  { label: 'Images', value: SearchCategory.Images, icon: 'heroicons_outline:photo' },
  { label: 'Videos', value: SearchCategory.Videos, icon: 'heroicons_outline:video-camera' },
  { label: 'News', value: SearchCategory.News, icon: 'heroicons_outline:newspaper' },
  { label: 'Map', value: SearchCategory.Map, icon: 'heroicons_outline:map' },
  { label: 'Music', value: SearchCategory.Music, icon: 'heroicons_outline:musical-note' },
  { label: 'Science', value: SearchCategory.Science, icon: 'heroicons_outline:academic-cap' },
]