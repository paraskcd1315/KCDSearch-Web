export interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
  type?: string;
  class?: string;
}

export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
  bounds?: { minlat: number; minlon: number; maxlat: number; maxlon: number };
}

export interface OverpassResponse {
  elements: OverpassElement[];
}

export interface MapPoi {
  id: string;
  lat: number;
  lon: number;
  name: string;
  type: string;
  address: string;
  openingHours?: string | null;
  raw?: OverpassElement;
  imageUrl?: string | null;
  website?: string | null;
  phone?: string | null;
  rating?: number | null;
}

export interface FoursquareGeocodes {
  main?: { latitude?: number; longitude?: number };
}

export interface FoursquareLocation {
  address?: string;
  locality?: string;
  region?: string;
  postcode?: string;
  admin_region?: string;
  country?: string;
  formatted_address?: string;
}

export interface FoursquareCategory {
  fsq_category_id?: number;
  name?: string;
  short_name?: string;
  plural_name?: string;
  icon?: { prefix?: string; suffix?: string };
}

export interface FoursquarePhoto {
  id?: string;
  prefix?: string;
  suffix?: string;
  width?: number;
  height?: number;
}

export interface FoursquarePlaceResult {
  fsq_place_id: string;
  latitude: number;
  longitude: number;
  categories?: FoursquareCategory[];
  date_created: string;
  date_refreshed: string;
  distance: number;
  link: string;
  location?: FoursquareLocation;
  name?: string;
  placemaker_url?: string;
  tel?: string;
  website?: string;
  hours?: { display?: string };
  rating?: number;
  photos?: FoursquarePhoto[];
  distance?: number;
}

export interface FoursquareSearchResponse {
  results?: FoursquarePlaceResult[];
}

export interface FoursquarePlaceDetails extends FoursquarePlaceResult {}
