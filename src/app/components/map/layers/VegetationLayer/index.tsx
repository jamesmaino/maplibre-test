"use client";

import { useState, useEffect } from "react";
import { RLayer, RPopup } from "maplibre-react-components";
import { MapLayerMouseEvent } from "maplibre-gl";
import * as Colors from "../../../shared/constants/Colors";
import { LayerConfig, LayerComponentProps } from "../../config/layerRegistry";

// ==========================================
// 1. Type Definitions
// ==========================================

interface TooltipInfo {
  longitude: number;
  latitude: number;
  properties: {
    EVC: string;
  };
}

// ==========================================
// 2. Main Layer Component
// ==========================================

function VegetationComponent({
  data,
  onPopupOpen,
  layerId,
}: LayerComponentProps) {
  const [tooltipInfo, setTooltipInfo] = useState<TooltipInfo | null>(null);
  const [tooltipTimeout, setTooltipTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
      }
    };
  }, [tooltipTimeout]);

  const handleMouseMove = (e: MapLayerMouseEvent) => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
    }

    if (e.features && e.features.length > 0) {
      const topFeature = e.features[0];
      const timeout = setTimeout(() => {
        setTooltipInfo({
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat,
          properties: {
            EVC: `${topFeature.properties.EVC_name} (${topFeature.properties.Status})`,
          },
        });
      }, 500);
      setTooltipTimeout(timeout);
    } else {
      setTooltipInfo(null);
    }
  };

  const handleMouseLeave = () => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
    }
    setTooltipInfo(null);
  };

  return (
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
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
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
