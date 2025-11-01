"use client";

import { useState } from "react";
import { RLayer } from "maplibre-react-components";
import { MapLayerMouseEvent } from "maplibre-gl";
import * as Colors from "../../../shared/constants/Colors";
import { LayerConfig, LayerComponentProps } from "../../config/layerRegistry";

// ==========================================
// 1. Main Layer Component
// ==========================================

function VegetationComponent({ onPopupOpen }: LayerComponentProps) {
  const [selectedEVC, setSelectedEVC] = useState<string | number | null>(null);

  const handleClick = (e: MapLayerMouseEvent) => {
    if (e.defaultPrevented) {
      return;
    }
    if (e.features && e.features.length > 0) {
      e.preventDefault();
      const feature = e.features[0];
      const evc = feature.properties.EVC;
      setSelectedEVC(evc);
      onPopupOpen({
        longitude: e.lngLat.lng,
        latitude: e.lngLat.lat,
        properties: feature.properties,
      });
    } else {
      setSelectedEVC(null);
    }
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
        onClick={handleClick}
      />
    </>
  );
}

//  {selectedEVC && (
//         <RLayer
//           id="vic-highlight"
//           source="protomaps"
//           source-layer="NV2005_EVCBCS_subset"
//           type="line"
//           paint={{
//             "line-color": "#444444",
//             "line-width": 1,
//           }}
//           filter={["==", ["get", "EVC"], selectedEVC]}
//         />
//       )}

// ==========================================
// 3. Layer Configuration
// ==========================================

export const vegetationLayer: LayerConfig = {
  id: "vegetation",
  name: "Vegetation",
  Component: VegetationComponent,
  // Note: No dataSource - uses vector tiles from map style (protomaps source)
};
