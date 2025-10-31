
import { useMemo } from "react";
import { RSource, RLayer } from "maplibre-react-components";
import { Geometry, FeatureCollection } from "geojson";
import { MapLayerMouseEvent } from "maplibre-gl";
import { LayerComponentProps, LayerConfig } from "../../config/layerRegistry";
import { getLayerIds } from "../../config/layerRegistry";
import * as Colors from "../../../shared/constants/Colors";

// ==========================================
// 1. Type Definitions
// ==========================================

export interface HistoricalData {
  _record_id: string;
  _latitude: number;
  _longitude: number;
  _geometry: Geometry;
  polygon_points: string | null;
  site_name: string | null;
  site_type?: string[];
  year_established?: string | null;
  landcare_region?: string | null;
  landholder_original?: string | null;
  site_description?: string | null;
}

// ==========================================
// 2. Data Transformation
// ==========================================

function transformToGeoJSON(data: HistoricalData[]): FeatureCollection {
  const features = data
    .filter((site) => {
      if (!site._geometry) {
        console.warn(`Historical site ${site._record_id} missing geometry, skipping`);
        return false;
      }
      return true;
    })
    .map((site) => ({
      type: "Feature" as const,
      properties: { ...site },
      geometry: site._geometry,
    }));

  return {
    type: "FeatureCollection",
    features,
  };
}

// ==========================================
// 3. Main Layer Component
// ==========================================

function HistoricalSitesComponent({ data, onPopupOpen, layerId }: LayerComponentProps<FeatureCollection>) {
  const ids = getLayerIds(layerId);

  const handleClick = (e: MapLayerMouseEvent) => {
    onPopupOpen({
      longitude: e.lngLat.lng,
      latitude: e.lngLat.lat,
      properties: e.features ? e.features[0].properties : null,
      showMissingData: true, // Encourage users to fill in missing data
    });
  };

  return (
    <>
      <RSource id={ids.source} type="geojson" data={data} />
      <RLayer
        id={ids.fill}
        source={ids.source}
        type="fill"
        paint={{
          "fill-color": Colors.foreground8,
          "fill-opacity": Colors.foreground_fill_opacity,
        }}
        onClick={handleClick}
        onMouseEnter={(e) => (e.target.getCanvas().style.cursor = "pointer")}
        onMouseLeave={(e) => (e.target.getCanvas().style.cursor = "")}
      />
      <RLayer
        id={ids.line}
        source={ids.source}
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

// ==========================================
// 4. Layer Configuration
// ==========================================

export const historicalSitesLayer: LayerConfig<FeatureCollection> = {
  id: "historicalSites",
  name: "Historical Sites",
  defaultVisible: true,
  Component: HistoricalSitesComponent,
  dataSource: {
    type: "fulcrum",
    requiresAuth: "admin",
    query: `
      SELECT
          *
      FROM
          "LOOKUP TABLE Long Term Sites Jallukar LCG"
    `,
    transform: transformToGeoJSON,
  },
  shouldShow: (data) => data.features.length > 0,
};
