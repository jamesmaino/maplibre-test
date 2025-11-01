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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (newSite[key as keyof HistoricalData] as any) = "MISSING";
    }
  }

  return newSite;
}

function transformToGeoJSON(rawData: unknown): FeatureCollection {
  const data = rawData as HistoricalData[];
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
    // Check if another layer already handled this click (Stack Overflow pattern)
    if (e.originalEvent.defaultPrevented) {
      return;
    }

    if (e.features && e.features.length > 0) {
      e.originalEvent.preventDefault();
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
    Colors.background2,
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          "fill-color": siteColorExpression as any,
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          "line-color": siteColorExpression as any,
          "line-width": Colors.line_width,
          "line-opacity": Colors.foreground_opacity,
        }}
      />
    </>
  );
}

// ==========================================
// 4. Helper Functions
// ==========================================

const SITE_TABLES = [
  "LOOKUP TABLE Long Term Sites Jallukar LCG",
  "LOOKUP TABLE Long Term Sites Moyston LCG",
  "LOOKUP TABLE Long Term Sites Black Range LMG",
  "LOOKUP TABLE Long Term Sites Elmhurst LCG",
  "LOOKUP TABLE Long Term Sites Northern Grampians LCG",
  "LOOKUP TABLE Long Term Sites Halls Gap LCG",
];

const SITE_COLUMNS = [
  "_record_id",
  "_latitude",
  "_longitude",
  "_geometry",
  "site_name",
  "site_type",
  "site_description",
  "site_landcare",
  "site_year_established",
  "site_landholder_original",
  "site_landholder_current",
  "site_manager_name",
  "site_initial_goals",
  "site_performance",
  "_created_at",
  "_updated_at",
];

const SITE_TYPE_FILTER =
  "site_type && ARRAY['Revegetation', 'Remnant habitat', 'Habitat supplement site']";

function buildHistoricalSitesQuery(): string {
  const selectClause = SITE_COLUMNS.join(",\n        ");

  return SITE_TABLES.map(
    (table) => `
      SELECT
        ${selectClause}
      FROM "${table}"
      WHERE ${SITE_TYPE_FILTER}
    `
  ).join("\n      UNION ALL\n");
}

// ==========================================
// 5. Layer Configuration
// ==========================================

export const historicalSitesLayer: LayerConfig<FeatureCollection> = {
  id: "historicalSites",
  name: "Habitat Islands",
  Component: HistoricalSitesComponent,
  dataSource: {
    type: "fulcrum",
    requiresAuth: "admin",
    query: buildHistoricalSitesQuery(),
    transform: transformToGeoJSON,
  },
  shouldShow: (data) => data.features.length > 0,
};
