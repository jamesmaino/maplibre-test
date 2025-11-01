// Generic GeoJSON-like feature structure
export interface MapFeature {
  type?: string;
  geometry?: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  };
  properties?: Record<string, unknown>;
  [key: string]: unknown;
}

// Generic map data - layers are keyed by layer ID
export type MapData = Record<string, MapFeature[]>;