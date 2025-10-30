import { ComponentType } from "react";
import { MapData } from "../../../../types/data";
import { VegetationLayer } from "../layers/VegetationLayer";
import { BirdFeedLayers } from "../layers/BirdFeedLayers";
import { GroupDataLayers } from "../layers/GroupDataLayers";

export interface PopupInfo {
  longitude: number;
  latitude: number;
  properties: any;
  type?: "bird" | "default";
}

/**
 * Common props passed to all layer components
 */
export interface LayerComponentProps {
  data: MapData;
  onPopupOpen: (info: PopupInfo) => void;
}

/**
 * Layer configuration interface
 */
export interface LayerConfig {
  id: string;
  name: string;
  defaultVisible: boolean;
  Component: ComponentType<LayerComponentProps>;
  // Determines if layer should be shown based on data availability
  shouldShow?: (data: MapData) => boolean;
}

/**
 * Central registry of all map layers
 *
 * To add a new layer:
 * 1. Create your layer component implementing LayerComponentProps
 * 2. Add an entry here
 * 3. Done!
 */
export const LAYER_REGISTRY: LayerConfig[] = [
  {
    id: "vegetation",
    name: "Vegetation",
    defaultVisible: true,
    Component: VegetationLayer,
  },
  {
    id: "birdFeeds",
    name: "Feeds",
    defaultVisible: false,
    Component: BirdFeedLayers,
  },
  {
    id: "groupData",
    name: "Group Data",
    defaultVisible: true,
    Component: GroupDataLayers,
    shouldShow: (data) =>
      data.squirrel_glider_data.length > 0 ||
      data.transect_data.length > 0 ||
      data.historical_data.length > 0,
  },
];

/**
 * Get layer configuration by ID
 */
export function getLayerConfig(id: string): LayerConfig | undefined {
  return LAYER_REGISTRY.find((layer) => layer.id === id);
}

/**
 * Get visible layers based on data
 */
export function getVisibleLayers(data: MapData): LayerConfig[] {
  return LAYER_REGISTRY.filter(
    (layer) => !layer.shouldShow || layer.shouldShow(data)
  );
}
