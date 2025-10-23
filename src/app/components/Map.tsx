"use client";

import CustomMarker from "./CustomMarker";
import PucMarker from "./PucMarker";
import { MapData } from "./ClientMap";
import { useState } from "react";
import { useEffect } from "react";
import { Protocol } from "pmtiles";
import maplibregl, { MapLayerMouseEvent } from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";
import {
  RMap,
  RMarker,
  RNavigationControl,
  RSource,
  RLayer,
  RPopup,
} from "maplibre-react-components";
import { FeatureCollection } from "geojson";
import RDraw from "./RDraw";

function Map({ data }: { data: MapData }) {
  const [popupInfo, setPopupInfo] = useState<{
    longitude: number;
    latitude: number;
    properties: any;
  } | null>(null);

  const [tooltipInfo, setTooltipInfo] = useState<{
    longitude: number;
    latitude: number;
    properties: any;
  } | null>(null);
  const [tooltipTimeout, setTooltipTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (popupInfo) {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
      }
      setTooltipInfo(null);
    }
  }, [popupInfo, tooltipTimeout]);

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

  useEffect(() => {
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  const [showData, setShowData] = useState(true);

  const maxSpeciesTotals =
    Math.max(
      ...(data.birdData.map((station) => station?.speciesData?.total ?? 0) ||
        [])
    ) || 0;

  const handleMapClick = (e: MapLayerMouseEvent) => {
    if (e.features && e.features.length > 0) {
      const topFeature = e.features[0];
      setPopupInfo({
        longitude: e.lngLat.lng,
        latitude: e.lngLat.lat,
        properties: topFeature.properties,
      });
    }
  };

  return (
    <div className="w-full h-screen" style={{ position: "relative", zIndex: 0 }}>
      <RMap
        initialCenter={[142.5, -37]}
        initialZoom={10}
        dragRotate={false}
        mapStyle={{
          version: 8,
          sources: {
            osm: {
              type: "raster",
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
              paint: {
                "raster-saturation": -1.0,
                "raster-contrast": -0.2,
                "raster-brightness-min": 0.1,
                "raster-brightness-max": 0.9,
              },
            },
            {
              id: "carto",
              source: "carto",
              "source-layer": "transportation",
              type: "line",
              paint: {
                "line-color": "#333333",
                "line-opacity": 0.5,
                "line-width": 2.5,
              },
            },
          ],
        }}
        onClick={handleMapClick}
      >
        <RDraw
          onCreate={(e) => console.log("onCreate", e)}
          onUpdate={(e) => console.log("onUpdate", e)}
          onDelete={(e) => console.log("onDelete", e)}
        />
        <RNavigationControl />
        {showData ? (
          <>
            <RLayer
              id="vic"
              source="protomaps"
              source-layer="NV2005_EVCBCS_subset"
              type="fill"
              paint={{
                "fill-color": [
                  "match",
                  ["get", "Group"],
                  "Herb-rich Woodlands",
                  "#3B243C",
                  "Plains Grasslands and Chenopod Shrublands",
                  "#2B3313",
                  "Riverine Grassy Woodlands or Forests",
                  "#262C48",
                  "Mallee",
                  "#083441",
                  "Lower Slopes or Hills Woodlands",
                  "#3F290E",
                  "Dry Forests",
                  "#0C372C",
                  "#442324",
                ],
                "fill-opacity": 0.2,
              }}
              onMouseMove={(e) => {
                if (tooltipTimeout) {
                  clearTimeout(tooltipTimeout);
                }

                if (popupInfo) return;

                if (e.features && e.features.length > 0) {
                  const topFeature = e.features[0];
                  const timeout = setTimeout(() => {
                    if (popupInfo) return;
                    setTooltipInfo({
                      longitude: e.lngLat.lng,
                      latitude: e.lngLat.lat,
                      properties: { EVC: topFeature.properties.EVC_name },
                    });
                  }, 500);
                  setTooltipTimeout(timeout);
                } else {
                  setTooltipInfo(null);
                }
              }}
              onMouseLeave={(e) => {
                if (tooltipTimeout) {
                  clearTimeout(tooltipTimeout);
                }
                setTooltipInfo(null);
              }}
            />
            {data.birdData.map((station) => {
              const speciesCount = station.speciesData?.total || 0;

              return (
                <RMarker
                  key={station.id}
                  longitude={station.coords.lon}
                  latitude={station.coords.lat}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPopupInfo({
                      longitude: station.coords.lon,
                      latitude: station.coords.lat,
                      properties: {
                        total_birds: station?.speciesData?.total
                          ? station?.speciesData.total
                          : null,
                      },
                    });
                  }}
                >
                  <PucMarker
                    speciesCount={speciesCount}
                    baseColor="#3B243C"
                    upper={maxSpeciesTotals}
                  />
                </RMarker>
              );
            })}
            {data.squirrel_glider_data.map((point) => (
              <RMarker
                key={point.observation_id}
                longitude={point._longitude}
                latitude={point._latitude}
                onClick={(e) => {
                  e.stopPropagation();
                  setPopupInfo({
                    longitude: point._longitude,
                    latitude: point._latitude,
                    properties: point,
                  });
                }}
              >
                <CustomMarker />
              </RMarker>
            ))}
            <RSource id="transects" type="geojson" data={transectFeatures} />
            <RLayer
              id="transects-fill"
              source="transects"
              type="fill"
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
            <RSource
              id="historical-sites"
              type="geojson"
              data={historicalDataFeatures}
            />
            <RLayer
              id="historical-sites-fill"
              source="historical-sites"
              type="fill"
              paint={{
                "fill-color": "#96bb0644",
              }}
              onClick={(e) => {
                setPopupInfo({
                  longitude: e.lngLat.lng,
                  latitude: e.lngLat.lat,
                  properties: e.features ? e.features[0].properties : null,
                });
                console.log(e.features && e.features[0].properties);
              }}
            />
            <RLayer
              id="historical-sites-line"
              source="historical-sites"
              type="line"
              paint={{
                "line-color": "#96bb06",
                "line-width": 2,
              }}
            />
          </>
        ) : (
          ""
        )}
        {popupInfo && (
          <RPopup
            className="text-black"
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            onMapMove={() => setPopupInfo(null)}
            onMapClick={() => setPopupInfo(null)}
          >
            {/* Assuming popupInfo is an object containing the feature properties */}
            <div className="p-2 text-xs">
              <h4 className="font-bold mb-1">Feature Info</h4>

              {Object.entries(popupInfo.properties)
                // Filter out keys (the first item in the array) that START with '_'
                .filter(([key]) => !key.startsWith("_"))

                // Map the filtered entries to your JSX elements
                .map(([key, value]) => (
                  <p key={key} className="text-slate-600">
                    <span className="font-semibold">{key}:</span>{" "}
                    {String(value)}
                  </p>
                ))}
            </div>
            <button
              className="w-4 h-4 text-lg maplibregl-popup-close-button"
              onClick={() => setPopupInfo(null)}
            >
              ×
            </button>
          </RPopup>
        )}
        {tooltipInfo && (
          <RPopup
            className="inverted-tooltip"
            longitude={tooltipInfo.longitude}
            latitude={tooltipInfo.latitude}
            onMapMove={() => setTooltipInfo(null)}
          >
            <div className="px-1 text-xs">
              <p>
                <span className="font-semibold">EVC:</span>{" "}
                {String(tooltipInfo.properties.EVC)}
              </p>
            </div>
          </RPopup>
        )}
      </RMap>
      <div className="absolute left-4 top-4 bg-black px-2 py-0 rounded-xl">
        <button onClick={() => setShowData((r) => !r)}>
          {showData ? "hide layers" : "show layers"}
        </button>
      </div>
    </div>
  );
}

export default Map;
