"use client";

import { RMap, RNavigationControl } from "maplibre-react-components";
import RDraw from "./controls/RDraw";
import { MapData } from "../../../types/data";
import { useState, useEffect } from "react";
import { Protocol } from "pmtiles";
import maplibregl from "maplibre-gl";

// Hooks
import { useLayerRegistry } from "../../../hooks/useLayerRegistry";

// Components
import { MapControls } from "./MapControls";
import { MapDataSources } from "./layers/MapDataSources";
import { MapPopup } from "./popups/MapPopup";

// Configuration
import { MAP_CENTER, MAP_ZOOM } from "./config/mapConstants";
import { createMapStyle, DRAW_CONFIG } from "./config/mapStyles";
import { PopupInfo } from "./config/layerRegistry";

import "maplibre-gl/dist/maplibre-gl.css";

function Map({ data }: { data: MapData }) {
  // Initialize PMTiles protocol
  useEffect(() => {
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  // Get active layers from registry
  const { layerToggles, activeLayers } = useLayerRegistry(data);

  // Popup state
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);

  const closePopup = () => setPopupInfo(null);

  return (
    <div className="w-full h-screen relative">
      <RMap
        initialCenter={MAP_CENTER}
        initialZoom={MAP_ZOOM}
        dragRotate={false}
        mapStyle={createMapStyle()}
        onClick={() => {}}
      >
        <RDraw
          onCreate={(e) => console.log("onCreate", e)}
          onUpdate={(e) => console.log("onUpdate", e)}
          onDelete={(e) => console.log("onDelete", e)}
          {...DRAW_CONFIG}
        />
        <RNavigationControl />
        <MapDataSources />

        {/* Render all active layers dynamically */}
        {activeLayers.map((layer) => {
          const Component = layer.Component;
          return (
            <Component key={layer.id} data={data} onPopupOpen={setPopupInfo} />
          );
        })}

        <MapPopup popupInfo={popupInfo} onClose={closePopup} />
      </RMap>

      <MapControls layerToggles={layerToggles} />
    </div>
  );
}

export default Map;
