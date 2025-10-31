
import { RSource, RLayer } from "maplibre-react-components";
import { Geometry, FeatureCollection } from "geojson";
import { LayerComponentProps, LayerConfig } from "../../config/layerRegistry";
import { getLayerIds } from "../../config/layerRegistry";
import * as Colors from "../../../shared/constants/Colors";

// ==========================================
// 1. Type Definitions
// ==========================================

export interface Transect {
  _record_id: string;
  _geometry: Geometry;
}

// ==========================================
// 2. Data Transformation
// ==========================================

function transformToGeoJSON(data: Transect[]): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: data.map((transect) => ({
      type: "Feature",
      properties: { ...transect },
      geometry: transect._geometry,
    })),
  };
}

// ==========================================
// 3. Main Layer Component
// ==========================================

function TransectComponent({ data, layerId }: LayerComponentProps<FeatureCollection>) {
  const ids = getLayerIds(layerId);

  return (
    <>
      <RSource id={ids.source} type="geojson" data={data} />
      <RLayer
        id={ids.fill}
        source={ids.source}
        type="fill"
        paint={{
          "fill-color": Colors.normal2,
          "fill-opacity": Colors.foreground_fill_opacity,
        }}
        onMouseEnter={(e) => (e.target.getCanvas().style.cursor = "pointer")}
        onMouseLeave={(e) => (e.target.getCanvas().style.cursor = "")}
      />
      <RLayer
        id={ids.line}
        source={ids.source}
        type="line"
        paint={{
          "line-color": Colors.foreground2,
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

export const transectLayer: LayerConfig<FeatureCollection> = {
  id: "transects",
  name: "Transects",
  defaultVisible: true,
  Component: TransectComponent,
  dataSource: {
    type: "fulcrum",
    requiresAuth: "admin",
    query: `
      SELECT
          *
      FROM
          "Project Platypus field crew logging"
      WHERE
          'Glider survey' = ANY(activity_type)
          AND is_this_a_day_or_night_survey = 'night'
          AND is_this_a_day_or_night_survey IS NOT NULL
    `,
    transform: transformToGeoJSON,
  },
  shouldShow: (data) => data.features.length > 0,
};
