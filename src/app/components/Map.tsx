"use client";

import CustomMarker from "./CustomMarker";
import { MapData } from "./ClientMap";
import { useState } from "react";
import { useEffect } from "react";
import { Protocol } from "pmtiles";
import maplibregl from "maplibre-gl";

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
      ...transect,
      type: "Feature",
      properties: {},
      geometry: transect._geometry,
    })),
  };

  useEffect(() => {
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  const [showData, setShowData] = useState(true);

  return (
    <div className="w-full h-screen">
      <RMap
        initialCenter={[142.5, -37]}
        initialZoom={10}
        dragRotate={false}
        mapStyle={{
          version: 8,
          sources: {
            osm: {
              type: "raster",
              // tiles: [
              //   "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
              // ],
              tiles: ["https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"],
              tileSize: 256,
              attribution: "&copy; OpenStreetMap Contributors",
              maxzoom: 15,
            },
            protomaps: {
              type: "vector",
              url: "pmtiles://https://storage.googleapis.com/conservation-pmtiles/NV2005_EVCBCS_subset.pmtiles",
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
              "raster-fade-duration": 2,
              paint: {
                "raster-saturation": -1.0,
                "raster-contrast": -0.2,
                "raster-brightness-min": 0.1,
                "raster-brightness-max": 0.9,
              }
            },
            {
              id: "vic",
              type: "vector",
              source: "protomaps",
              "source-layer": "NV2005_EVCBCS_subset",
              type: "fill",
              paint: {
                'fill-color': [
                  'match', ["get", "Group"],
                  // TODO make these colors variables
                  "Herb-rich Woodlands", "#3B243C",
                  "Plains Grasslands and Chenopod Shrublands", "#2B3313",
                  "Riverine Grassy Woodlands or Forests", "#262C48",
                  "Mallee", "#083441",
                  "Lower Slopes or Hills Woodlands", "#3F290E",
                  "Dry Forests", "#0C372C",
                  "#442324",
                ],
                'fill-opacity': 0.2
              },
            },
            {
              id: "carto",
              type: "vector",
              source: "carto",
              "source-layer": "transportation",
              type: "line",
              paint: {
                'line-color': "#333333",
                'line-opacity': 0.5,
                'line-width': 2.5,
              },
            },
          ],
        }}
      >
        <RNavigationControl />
        {showData ? (
          <>
            {data.squirrel_glider_data.map((point) => (
              <RMarker
                key={point.observation_id}
                longitude={point._longitude}
                latitude={point._latitude}
                onClick={() => window.alert(JSON.stringify(point))}
              >
                <CustomMarker />
              </RMarker>
            ))}
            <RSource id="transects" type="geojson" data={transectFeatures} />
            <RLayer
              id="transects-fill"
              source="transects"
              type="fill"
              onClick={() => window.alert(JSON.stringify(transectFeatures))}
              paint={{
                "fill-color": "#FED0D1",
                "fill-opacity": 0.5,
              }}
            />
            <RLayer
              id="transects-line"
              source="transects"
              type="line"
              paint={{
                "line-color": "#FED0D1",
                "line-width": 2,
                "line-opacity": 0.5,
              }}
            />
          </>
        ) : (
          ""
        )}
      </RMap>
      <div className="absolute left-4 top-4 bg-black px-2 py-0 rounded-xl">
        <button onClick={() => setShowData((r) => !r)}>
          {showData ? "hide" : "show"}
        </button>
      </div>
    </div>
  );
}

export default Map;
