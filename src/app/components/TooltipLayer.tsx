"use client";

import { useState, useEffect } from "react";
import { RLayer, RPopup } from "maplibre-react-components";
import { MapLayerMouseEvent } from "maplibre-gl";
import * as Colors from "./Colors";

function TooltipLayer({ popupInfo }: { popupInfo: any }) {
  const [tooltipInfo, setTooltipInfo] = useState<{
    longitude: number;
    latitude: number;
    properties: any;
  } | null>(null);
  const [tooltipTimeout, setTooltipTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    if (popupInfo) {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
      }
      setTooltipInfo(null);
    }
  }, [popupInfo, tooltipTimeout]);

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
        onMouseMove={(e: MapLayerMouseEvent) => {
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
                properties: {
                  EVC: `${topFeature.properties.EVC_name} (${topFeature.properties.Status})`,
                },
              });
            }, 500);
            setTooltipTimeout(timeout);
          } else {
            setTooltipInfo(null);
          }
        }}
        onMouseLeave={() => {
          if (tooltipTimeout) {
            clearTimeout(tooltipTimeout);
          }
          setTooltipInfo(null);
        }}
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

export default TooltipLayer;
