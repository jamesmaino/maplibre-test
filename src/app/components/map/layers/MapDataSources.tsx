import { RSource } from "maplibre-react-components";
import { TILE_SOURCES, TILE_SIZE, LAYER_IDS } from "../config/mapConstants";

/**
 * Defines all map data sources
 */
export function MapDataSources() {
  return (
    <RSource
      id={LAYER_IDS.INATURALIST_SOURCE}
      type="raster"
      tiles={[TILE_SOURCES.INATURALIST]}
      tileSize={TILE_SIZE}
    />
  );
}
