"use client";

import CustomMarker from "./CustomMarker";
import { MapData } from "./ClientMap";
import { useState } from "react";

import "maplibre-gl/dist/maplibre-gl.css";
import {
  RMap,
  RMarker,
  RNavigationControl,
  RSource,
  RLayer,
} from "maplibre-react-components";
import { Feature, FeatureCollection, Geometry } from "geojson";
import { stringify } from "querystring";

function Map({ data }: { data: MapData }) {
  const transectFeatures: FeatureCollection = {
    type: "FeatureCollection",
    features: data.transect_data.map((transect) => {
      const { _geometry, ...properties } = transect;
      return {
        type: "Feature",
        properties,
        geometry: transect._geometry,
      };
    }),
  };

  const historicalDataFeatures: FeatureCollection = {
    type: "FeatureCollection",
    features: data.historical_data.map((site) => {
      const { _geometry, polygon_points, ...properties } = site;
      return {
        type: "Feature",
        properties,
        geometry: site._geometry,
      };
    }),
  };

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
                onClick={() => window.alert(JSON.stringify(point, null, 2))}
              >
                <CustomMarker />
              </RMarker>
            ))}
            <RSource id="transects" type="geojson" data={transectFeatures} />
            <RLayer
              id="transects-fill"
              source="transects"
              type="fill"
              onClick={(e) =>
                window.alert(
                  JSON.stringify(
                    e.features && e.features[0].properties,
                    null,
                    2
                  )
                )
              }
              paint={{
                "fill-color": "#36ffff44",
              }}
            />
            <RLayer
              id="transects-line"
              source="transects"
              type="line"
              paint={{
                "line-color": "#36ffff",
                "line-width": 2,
              }}
            />
            <RSource
              id="historical-sites"
              type="geojson"
              data={historicalDataFeatures}
            />
            <RLayer
              id="historical-sites-fill"
              source="historical-sites"
              type="fill"
              onClick={(e) =>
                window.alert(
                  JSON.stringify(
                    e.features && e.features[0].properties,
                    null,
                    2
                  )
                )
              }
              paint={{
                "fill-color": "#ff363644",
              }}
            />
            <RLayer
              id="historical-sites-line"
              source="historical-sites"
              type="line"
              paint={{
                "line-color": "#ff3636",
                "line-width": 2,
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
