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
  openingHours: string | null;
  raw: OverpassElement;
  imageUrl?: string | null;
}
