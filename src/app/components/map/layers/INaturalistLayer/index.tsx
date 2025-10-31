import { RSource, RLayer } from "maplibre-react-components";
import { LayerComponentProps, LayerConfig } from "../../config/layerRegistry";
import { TILE_SOURCES, TILE_SIZE } from "../../config/mapConstants";

// ==========================================
// 1. Main Layer Component
// ==========================================

function INaturalistComponent({ layerId }: LayerComponentProps) {
  const sourceId = `${layerId}-source`;
  const rasterLayerId = `${layerId}-raster`;

  return (
    <>
      <RSource
        id={sourceId}
        type="raster"
        tiles={[TILE_SOURCES.INATURALIST]}
        tileSize={TILE_SIZE}
      />
      <RLayer
        id={rasterLayerId}
        type="raster"
        source={sourceId}
        paint={{ "raster-opacity": 0.7 }}
      />
    </>
  );
}

// ==========================================
// 2. Layer Configuration
// ==========================================

export const iNaturalistLayer: LayerConfig = {
  id: "iNaturalist",
  name: "iNaturalist",
  defaultVisible: true,
  Component: INaturalistComponent,
  // Note: No dataSource - uses raster tiles from iNaturalist
};
