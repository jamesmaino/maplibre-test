import * as Colors from "../../shared/constants/Colors";
import { TILE_SOURCES, TILE_SIZE, MAX_ZOOM } from "./mapConstants";

/**
 * Creates the base map style configuration
 */
export function createMapStyle() {
  return {
    version: 8 as const,
    sources: {
      osm: {
        type: "raster" as const,
        tiles: [TILE_SOURCES.GOOGLE_SATELLITE],
        tileSize: TILE_SIZE,
        attribution: "&copy; OpenStreetMap Contributors",
        maxzoom: MAX_ZOOM,
      },
      protomaps: {
        type: "vector" as const,
        url: TILE_SOURCES.PMTILES_VEGETATION,
      },
      carto: {
        type: "vector" as const,
        url: TILE_SOURCES.CARTO_VECTOR,
      },
    },
    sprite: TILE_SOURCES.CARTO_SPRITE,
    glyphs: TILE_SOURCES.CARTO_GLYPHS,
    layers: [
      {
        id: "osm",
        type: "raster" as const,
        source: "osm",
        paint: {
          "raster-saturation": -1.0,
          "raster-contrast": -0.1,
          "raster-brightness-min": 0.4,
          "raster-brightness-max": 0.9,
        },
      },
      {
        id: "carto",
        source: "carto",
        "source-layer": "transportation",
        type: "line" as const,
        paint: {
          "line-color": "#333333",
          "line-opacity": 0.5,
          "line-width": Colors.line_width,
        },
      },
    ],
  };
}
