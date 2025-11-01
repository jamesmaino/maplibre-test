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

function mapNullValuesToMissing(site: HistoricalData): HistoricalData {
  const newSite = { ...site };

  for (const key in newSite) {
    if (
      newSite.hasOwnProperty(key) &&
      newSite[key as keyof HistoricalData] === null
    ) {
      (newSite[key as keyof HistoricalData] as any) = "MISSING";
    }
  }

  return newSite;
}

function transformToGeoJSON(data: HistoricalData[]): FeatureCollection {
  const features = data
    .filter((site) => {
      if (!site._geometry) {
        console.warn(
          `Historical site ${site._record_id} missing geometry, skipping`
        );
        return false;
      }
      return true;
    })
    .map((site) => {
      const siteWithMissing = mapNullValuesToMissing(site);
      const simpleSiteType = siteWithMissing.site_type?.[0] || "Unknown";
      return {
        type: "Feature" as const,
        properties: {
          ...siteWithMissing,
          site_type_simple: simpleSiteType,
        },
        geometry: siteWithMissing._geometry,
      };
    });

  return {
    type: "FeatureCollection",
    features,
  };
}

// ==========================================
// 3. Main Layer Component
// ==========================================

function HistoricalSitesComponent({
  data,
  onPopupOpen,
  layerId,
}: LayerComponentProps<FeatureCollection>) {
  const ids = getLayerIds(layerId);

  const handleClick = (e: MapLayerMouseEvent) => {
    if (e.defaultPrevented) {
      return;
    }

    if (e.features && e.features.length > 0) {
      e.originalEvent.preventDefault();
      e.originalEvent.stopPropagation();
      onPopupOpen({
        longitude: e.lngLat.lng,
        latitude: e.lngLat.lat,
        properties: e.features[0].properties,
      });
    }
  };

  const siteColorExpression = [
    "match",
    ["get", "site_type_simple"],
    "Revegetation",
    Colors.normal2,
    "Remnant habitat",
    Colors.foreground8,
    /* other */ Colors.background9,
  ];

  return (
    <>
      <RSource id={ids.source} type="geojson" data={data} />
      <RLayer
        id={ids.fill}
        source={ids.source}
        type="fill"
        paint={{
          "fill-color": siteColorExpression,
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
          "line-color": siteColorExpression,
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
