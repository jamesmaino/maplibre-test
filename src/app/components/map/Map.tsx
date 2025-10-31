"use client";

import { RMap, RNavigationControl } from "maplibre-react-components";
import { useState, useEffect } from "react";
import { Protocol } from "pmtiles";
import maplibregl from "maplibre-gl";

// Hooks
import { useLayerRegistry } from "../../../hooks/useLayerRegistry";

// Components
import { MapControls } from "./MapControls";
import { MapPopup } from "./popups/MapPopup";

// Configuration
import { MAP_CENTER, MAP_ZOOM } from "./config/mapConstants";
import { createMapStyle } from "./config/mapStyles";
import { PopupInfo } from "./config/layerRegistry";

import "maplibre-gl/dist/maplibre-gl.css";

interface MapProps {
  pageId?: 'biolinks' | 'weeds' | 'heritage';
}

function Map({ pageId = 'biolinks' }: MapProps) {
  // Initialize PMTiles protocol
  useEffect(() => {
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  // Popup state
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);

  // Get active layers from registry for this page
  const { layerToggles, activeLayers } = useLayerRegistry(setPopupInfo, pageId);

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
        <RNavigationControl />

        {/* Render all active layers dynamically */}
        {activeLayers.map((layer) => {
          const Component = layer.Component;
          return (
            <Component key={layer.id} {...layer.props} />
          );
        })}

        <MapPopup popupInfo={popupInfo} onClose={closePopup} />
      </RMap>

      <MapControls layerToggles={layerToggles} />
    </div>
  );
}

export default Map;