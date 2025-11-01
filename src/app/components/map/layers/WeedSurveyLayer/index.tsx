import { useMemo } from "react";
import { RSource, RLayer } from "maplibre-react-components";
import { MapLayerMouseEvent } from "maplibre-gl";
import { Geometry } from "geojson";
import {
  LayerConfig,
  LayerComponentProps,
  UserContext,
} from "../../config/layerRegistry";
import { getLayerIds } from "../../config/layerRegistry";
import * as Colors from "../../../shared/constants/Colors";

// ==========================================
// 0. Helper Functions (local to this layer)
// ==========================================

const GROUP_TO_FORM_NAME: Record<string, string> = {
  jallukar: "Jallukar LCG",
  moyston: "Moyston LCG",
  "black-range": "Black Range LMG",
  elmhurst: "Elmhurst LCG",
  "northern-grampians": "Northern Grampians LCG",
};

function getFormNameForGroup(landcareGroup?: string): string {
  const groupKey = (landcareGroup || "halls-gap").toLowerCase();
  return GROUP_TO_FORM_NAME[groupKey] || GROUP_TO_FORM_NAME["halls-gap"];
}

// ==========================================
// 1. Type Definitions (local to this layer)
// ==========================================

export interface WeedSurvey {
  _child_record_id: string;
  _parent_id: string;
  _record_id: string;
  _index: number;
  _geometry: Geometry;
  parent_record_id: string;
  parent_date: string;
  parent_name: string;
  date: string;
  name: string;
  landcare_group: string;
  weed_scientific_name: string;
  weed_common_name: string;
  weed_density: string[];
  weed_activity: string[];
  weed_technique: string | null;
  weed_mgmt_aim: string | null;
  weed_conclusion_status: string[];
  weed_followup: string[];
  weed_notes: string | null;
  weed_entire_area: string;
  polygon_area: number;
  polygon_points: string;
}

// ==========================================
// 2. Data Transformation (local to this layer)
// ==========================================

function transformToGeoJSON(data: WeedSurvey[]) {
  return {
    type: "FeatureCollection" as const,
    features: data.map((survey) => ({
      type: "Feature" as const,
      properties: { ...survey },
      geometry: survey._geometry,
    })),
  };
}

// ==========================================
// 3. Component (local to this layer)
// ==========================================

function WeedSurveyComponent({
  data,
  onPopupOpen,
  layerId,
}: LayerComponentProps<WeedSurvey[]>) {
  const ids = getLayerIds(layerId);

  const geoJsonData = useMemo(() => transformToGeoJSON(data), [data]);

  const handleClick = (e: MapLayerMouseEvent) => {
    if (e.defaultPrevented) {
      return;
    }

    if (e.features && e.features.length > 0) {
      e.preventDefault();
      onPopupOpen({
        longitude: e.lngLat.lng,
        latitude: e.lngLat.lat,
        properties: e.features[0].properties,
      });
    }
  };

  return (
    <>
      <RSource id={ids.source} type="geojson" data={geoJsonData} />

      <RLayer
        id={ids.fill}
        source={ids.source}
        type="fill"
        paint={{
          "fill-color": Colors.normal7,
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
          "line-color": Colors.foreground7,
          "line-width": Colors.line_width,
          "line-opacity": Colors.foreground_opacity,
        }}
      />
    </>
  );
}

// ==========================================
// 4. Layer Configuration (exported)
// ==========================================

export const weedSurveyLayer: LayerConfig<WeedSurvey[]> = {
  id: "weedSurveys",
  name: "Weed Surveys",
  dataSource: {
    type: "fulcrum",
    requiresAuth: "user",

    // Build query dynamically with user context
    query: (ctx: UserContext) => {
      const formName = getFormNameForGroup(ctx.user.landcareGroup);

      return `
        SELECT
            Parent._record_id AS parent_record_id,
            Parent.date AS parent_date,
            Parent.name AS parent_name,
            Repeat.*
        FROM
            "Landcare Activity Tracking Form_${formName}" AS Parent
        JOIN
            "Landcare Activity Tracking Form_${formName}/weed_hotspot" AS Repeat
        ON
            Parent._record_id = Repeat._parent_id;
      `;
    },
  },

  Component: WeedSurveyComponent,

  shouldShow: (data) => data.length > 0,
};
