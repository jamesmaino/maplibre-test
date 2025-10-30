import { useMemo } from "react";
import { RMarker, RSource, RLayer } from "maplibre-react-components";
import { MapLayerMouseEvent } from "maplibre-gl";
import CustomMarker from "../markers/CustomMarker";
import * as Colors from "../../shared/constants/Colors";
import { LayerComponentProps } from "../config/layerRegistry";
import { LAYER_IDS } from "../config/mapConstants";
import {
  transformTransectsToGeoJSON,
  transformHistoricalDataToGeoJSON,
} from "../../../../utils/geoJsonTransformers";

/**
 * Renders group data layers (squirrel gliders, transects, historical sites)
 */
export function GroupDataLayers({ data, onPopupOpen }: LayerComponentProps) {
  const transectFeatures = useMemo(
    () => transformTransectsToGeoJSON(data.transect_data),
    [data.transect_data]
  );

  const historicalFeatures = useMemo(
    () => transformHistoricalDataToGeoJSON(data.historical_data),
    [data.historical_data]
  );

  const handleSquirrelGliderClick = (point: any) => {
    onPopupOpen({
      longitude: point._longitude,
      latitude: point._latitude,
      properties: point,
    });
  };

  const handleHistoricalSiteClick = (e: MapLayerMouseEvent) => {
    onPopupOpen({
      longitude: e.lngLat.lng,
      latitude: e.lngLat.lat,
      properties: e.features ? e.features[0].properties : null,
    });
  };
  return (
    <>
      {/* Squirrel Glider Markers */}
      {data.squirrel_glider_data.map((point) => (
        <RMarker
          key={point.observation_id}
          longitude={point._longitude}
          latitude={point._latitude}
          onClick={(e) => {
            e.stopPropagation();
            handleSquirrelGliderClick(point);
          }}
        >
          <CustomMarker
            baseColor={Colors.normal2}
            opacity={Colors.foreground_opacity}
          />
        </RMarker>
      ))}

      {/* Transects */}
      <RSource id={LAYER_IDS.TRANSECTS_SOURCE} type="geojson" data={transectFeatures} />
      <RLayer
        id={LAYER_IDS.TRANSECTS_FILL}
        source={LAYER_IDS.TRANSECTS_SOURCE}
        type="fill"
        paint={{
          "fill-color": Colors.normal2,
          "fill-opacity": Colors.foreground_fill_opacity,
        }}
        onMouseEnter={(e) => (e.target.getCanvas().style.cursor = "pointer")}
        onMouseLeave={(e) => (e.target.getCanvas().style.cursor = "")}
      />
      <RLayer
        id={LAYER_IDS.TRANSECTS_LINE}
        source={LAYER_IDS.TRANSECTS_SOURCE}
        type="line"
        paint={{
          "line-color": Colors.foreground2,
          "line-width": Colors.line_width,
          "line-opacity": Colors.foreground_opacity,
        }}
      />

      {/* Historical Sites */}
      <RSource
        id={LAYER_IDS.HISTORICAL_SITES_SOURCE}
        type="geojson"
        data={historicalFeatures}
      />
      <RLayer
        id={LAYER_IDS.HISTORICAL_SITES_FILL}
        source={LAYER_IDS.HISTORICAL_SITES_SOURCE}
        type="fill"
        paint={{
          "fill-color": Colors.foreground8,
          "fill-opacity": Colors.foreground_fill_opacity,
        }}
        onClick={handleHistoricalSiteClick}
        onMouseEnter={(e) => (e.target.getCanvas().style.cursor = "pointer")}
        onMouseLeave={(e) => (e.target.getCanvas().style.cursor = "")}
      />
      <RLayer
        id={LAYER_IDS.HISTORICAL_SITES_LINE}
        source={LAYER_IDS.HISTORICAL_SITES_SOURCE}
        type="line"
        paint={{
          "line-color": Colors.foreground8,
          "line-width": Colors.line_width,
          "line-opacity": Colors.foreground_opacity,
        }}
      />
    </>
  );
}
