"use client";

import { useState, useEffect, useRef } from "react";
import { RLayer, useMap } from "maplibre-react-components";
import { MapLayerMouseEvent } from "maplibre-gl";
import * as Colors from "../../../shared/constants/Colors";
import { LayerConfig, LayerComponentProps } from "../../config/layerRegistry";

// ==========================================
// 1. Main Layer Component
// ==========================================

function VegetationComponent({ onPopupOpen }: LayerComponentProps) {
  const [selectedEVC, setSelectedEVC] = useState<string | number | null>(null);
  const map = useMap();
  const layerClickedRef = useRef(false);

  // Add map-level click handler to clear selection when clicking off vegetation
  useEffect(() => {
    if (!map) return;

    const handleMapClick = (e: MapLayerMouseEvent) => {
      // If the layer click handler was triggered, don't do anything
      if (layerClickedRef.current) {
        layerClickedRef.current = false;
        return;
      }

      // Only clear if another layer didn't handle it
      if (!e.originalEvent.defaultPrevented) {
        setSelectedEVC(null);
      }
    };

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
    };
  }, [map]);

  const handleClick = (e: MapLayerMouseEvent) => {
    // Check if another layer already handled this click (Stack Overflow pattern)
    if (e.originalEvent.defaultPrevented) {
      return;
    }

    if (e.features && e.features.length > 0) {
      // Mark that layer was clicked
      layerClickedRef.current = true;

      e.originalEvent.preventDefault();
      const feature = e.features[0];
      const evc = feature.properties.EVC;
      setSelectedEVC(evc);
      onPopupOpen({
        longitude: e.lngLat.lng,
        latitude: e.lngLat.lat,
        properties: feature.properties,
      });
    }
  };

  return (
    <>
      <RLayer
        id="vic"
        source="protomaps"
        source-layer="NV2005_EVCBCS_subset"
        type="fill"
        beforeId="historicalSites-fill"
        paint={{
          "fill-color": [
            "match",
            ["get", "Group"],
            "Wet or Damp Forests",
            Colors.background1,
            "Riparian Scrubs or Swampy Scrubs and Woodlands",
            Colors.background2,
            "Herb-rich Woodlands",
            Colors.background3,
            "Plains Grasslands and Chenopod Shrublands",
            Colors.background4,
            "Riverine Grassy Woodlands or Forests",
            Colors.background5,
            "Mallee",
            Colors.background6,
            "Lower Slopes or Hills Woodlands",
            Colors.background7,
            "Dry Forests",
            Colors.background8,
            "Plains Woodlands or Forests",
            Colors.background9,
            Colors.background10,
          ],
          "fill-opacity": Colors.background_opacity,
        }}
        onClick={handleClick}
      />
      <RLayer
        id="vic-highlight"
        source="protomaps"
        source-layer="NV2005_EVCBCS_subset"
        type="line"
        beforeId="historicalSites-fill"
        paint={{
          "line-color": "#444444",
          "line-width": 1,
          "line-opacity": selectedEVC ? 1 : 0,
        }}
        filter={selectedEVC ? ["==", ["get", "EVC"], selectedEVC] : ["==", ["get", "EVC"], ""]}
      />
    </>
  );
}

// ==========================================
// 3. Layer Configuration
// ==========================================

export const vegetationLayer: LayerConfig = {
  id: "vegetation",
  name: "Vegetation",
  Component: VegetationComponent,
  // Note: No dataSource - uses vector tiles from map style (protomaps source)
};
