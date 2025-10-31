/**
 * Map configuration constants
 */

export const MAP_CENTER: [number, number] = [142.5, -37];
export const MAP_ZOOM = 10;

/**
 * Tile source URLs
 */
export const TILE_SOURCES = {
  GOOGLE_SATELLITE: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  PMTILES_VEGETATION:
    "pmtiles://https://storage.googleapis.com/conservation-pmtiles/NV2005_EVCBCS_subset.pmtiles",
  CARTO_VECTOR: "https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json",
  CARTO_SPRITE: "https://tiles.basemaps.cartocdn.com/gl/positron-gl-style/sprite",
  CARTO_GLYPHS: "https://tiles.basemaps.cartocdn.com/fonts/{fontstack}/{range}.pbf",
  INATURALIST:
    "https://api.inaturalist.org/v1/points/{z}/{x}/{y}.png?taxon_id=54686&geoprivacy=open&taxon_geoprivacy=open&obscuration=none",
} as const;

/**
 * Map layer IDs
 */
export const LAYER_IDS = {
  OSM: "osm",
  CARTO: "carto",
} as const;

/**
 * Tile size configuration
 */
export const TILE_SIZE = 256;
export const MAX_ZOOM = 25;