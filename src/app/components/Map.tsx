"use client";

import CustomMarker from "./CustomMarker";
import { MapData } from "./ClientMap";

import "maplibre-gl/dist/maplibre-gl.css";
import {
  RMap,
  RMarker,
  RNavigationControl,
  RSource,
  RLayer,
} from "maplibre-react-components";
import { FeatureCollection } from "geojson";

function Map({ data }: { data: MapData }) {
  const transectFeatures: FeatureCollection = {
    type: "FeatureCollection",
    features: data.transect_data.map((transect) => ({
      type: "Feature",
      properties: {},
      geometry: transect._geometry,
    })),
  };

  return (
    <div className="w-full h-screen">
      <RMap
        initialCenter={[142.5, -37]}
        initialZoom={10}
        mapStyle={{
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: [
                "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
              ],
              tileSize: 256,
              attribution: "&copy; OpenStreetMap Contributors",
              maxzoom: 15,
            },
            carto: {
              type: "vector",
              url: "https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json",
            },
          },
          sprite:
            "https://tiles.basemaps.cartocdn.com/gl/positron-gl-style/sprite",
          glyphs:
            "https://tiles.basemaps.cartocdn.com/fonts/{fontstack}/{range}.pbf",
          layers: [
            {
              id: "osm",
              type: "raster",
              source: "osm",
            },
          ],
          sky: {},
        }}
      >
        <RNavigationControl visualizePitch={true} />
        {data.squirrel_glider_data.map((point) => (
          <RMarker
            key={point.observation_id}
            longitude={point._longitude}
            latitude={point._latitude}
          >
            <CustomMarker />
          </RMarker>
        ))}
        <RSource id="transects" type="geojson" data={transectFeatures} />
        <RLayer
            id="transects-layer"
            source="transects"
            type="line"
            paint={{
              "line-color": "#ff0000",
              "line-width": 2,
            }}
          />
      </RMap>
    </div>
  );
}

export default Map;
