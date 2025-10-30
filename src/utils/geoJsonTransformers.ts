import { FeatureCollection } from "geojson";
import { Transect, HistoricalData } from "../types/data";

/**
 * Transforms transect data to GeoJSON FeatureCollection
 */
export function transformTransectsToGeoJSON(
  data: Transect[]
): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: data.map((transect) => {
      const { _geometry, ...properties } = transect;
      return {
        type: "Feature",
        properties,
        geometry: transect._geometry,
      };
    }),
  };
}

/**
 * Transforms historical site data to GeoJSON FeatureCollection
 */
export function transformHistoricalDataToGeoJSON(
  data: HistoricalData[]
): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: data.map((site) => {
      const { _geometry, polygon_points, ...properties } = site;
      return {
        type: "Feature",
        properties,
        geometry: site._geometry,
      };
    }),
  };
}
