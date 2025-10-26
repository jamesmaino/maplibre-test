"use client";

import CustomMarker from "./CustomMarker";
import PucMarker from "./PucMarker";
import { MapData } from "./ClientMap";
import { useState, useEffect, useCallback } from "react";
import { Protocol } from "pmtiles";
import maplibregl, { MapLayerMouseEvent } from "maplibre-gl";
import * as Colors from "./Colors";

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
import TooltipLayer from "./TooltipLayer";

function Map({ data }: { data: MapData }) {
  const [popupInfo, setPopupInfo] = useState<{
    longitude: number;
    latitude: number;
    properties: any;
  } | null>(null);

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

  const [showProtomaps, setShowProtomaps] = useState(true);
  const [showDevices, setShowDevices] = useState(true);
  const [showGroupData, setShowGroupData] = useState(true);

  const hasGroupData =
    data.squirrel_glider_data.length > 0 ||
    data.transect_data.length > 0 ||
    data.historical_data.length > 0;

  const buttonConfigs = [
    {
      state: showProtomaps,
      onClick: () => setShowProtomaps((r) => !r),
      text: "Vegetation",
    },
    {
      state: showDevices,
      onClick: () => setShowDevices((r) => !r),
      text: "Devices",
    },
    {
      state: showGroupData,
      onClick: () => setShowGroupData((r) => !r),
      text: "Group Data",
      hidden: !hasGroupData,
    },
  ];

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
                "line-width": Colors.line_width,
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
          color={Colors.normal6}
          opacity={Colors.foreground_opacity}
          fill_opacity={Colors.foreground_fill_opacity}
          line_width={Colors.line_width}
        />
        <RNavigationControl />
        {showProtomaps && <TooltipLayer popupInfo={popupInfo} />}

        {showDevices ? (
          <>
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
                    baseColor={Colors.foreground4}
                    opacity={Colors.foreground_opacity}
                    upper={maxSpeciesTotals}
                  />
                </RMarker>
              );
            })}
          </>
        ) : (
          ""
        )}
        {showGroupData ? (
          <>
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
                <CustomMarker
                  baseColor={Colors.normal2}
                  opacity={Colors.foreground_opacity}
                />
              </RMarker>
            ))}
            <RSource id="transects" type="geojson" data={transectFeatures} />
            <RLayer
              id="transects-fill"
              source="transects"
              type="fill"
              paint={{
                "fill-color": Colors.normal2,
                "fill-opacity": Colors.foreground_fill_opacity,
              }}
              onMouseEnter={(e) =>
                (e.target.getCanvas().style.cursor = "pointer")
              }
              onMouseLeave={(e) => (e.target.getCanvas().style.cursor = "")}
            />
            <RLayer
              id="transects-line"
              source="transects"
              type="line"
              paint={{
                "line-color": Colors.foreground2,
                "line-width": Colors.line_width,
                "line-opacity": Colors.foreground_opacity,
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
                "fill-color": Colors.foreground8,
                "fill-opacity": Colors.foreground_fill_opacity,
              }}
              onClick={(e) => {
                setPopupInfo({
                  longitude: e.lngLat.lng,
                  latitude: e.lngLat.lat,
                  properties: e.features ? e.features[0].properties : null,
                });
                console.log(e.features && e.features[0].properties);
              }}
              onMouseEnter={(e) =>
                (e.target.getCanvas().style.cursor = "pointer")
              }
              onMouseLeave={(e) => (e.target.getCanvas().style.cursor = "")}
            />
            <RLayer
              id="historical-sites-line"
              source="historical-sites"
              type="line"
              paint={{
                "line-color": Colors.foreground8,
                "line-width": Colors.line_width,
                "line-opacity": Colors.foreground_opacity,
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
                    <span className="font-semibold">
                      {key.replaceAll("_", " ")}:
                    </span>{" "}
                    {String(value)}
                  </p>
                ))}
            </div>
            <button
              className=" maplibregl-popup-close-button flex items-center text-lg py-1 px-2"
              onClick={() => setPopupInfo(null)}
            >
              ×
            </button>
          </RPopup>
        )}
      </RMap>
      <div className="absolute left-4 top-4 flex flex-col space-y-2">
        {buttonConfigs.map(
          (config, index) =>
            !config.hidden && (
              <button
                key={index}
                onClick={config.onClick}
                className={`px-2 py-1 rounded-md text-sm font-medium ${
                  config.state
                    ? "bg-gray-600 text-white hover:bg-gray-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {config.state ? `${config.text} On` : `${config.text} Off`}
              </button>
            )
        )}
      </div>
    </div>
  );
}

export default Map;
