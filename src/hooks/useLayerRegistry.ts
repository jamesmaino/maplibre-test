import { useState, useMemo } from "react";
import { MapData } from "../types/data";
import { LAYER_REGISTRY, getVisibleLayers } from "../app/components/map/config/layerRegistry";

/**
 * Manages layer visibility using the layer registry
 * All layer configuration is centralized in layerRegistry.ts
 */
export function useLayerRegistry(data: MapData) {
  // Initialize state from registry defaults
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>(
    () =>
      LAYER_REGISTRY.reduce(
        (acc, layer) => ({
          ...acc,
          [layer.id]: layer.defaultVisible,
        }),
        {}
      )
  );

  const visibleLayers = useMemo(
    () => getVisibleLayers(data),
    [data]
  );

  const layerToggles = useMemo(
    () =>
      visibleLayers.map((layer) => ({
        id: layer.id,
        name: layer.name,
        isVisible: layerVisibility[layer.id] ?? layer.defaultVisible,
        toggle: () =>
          setLayerVisibility((prev) => ({
            ...prev,
            [layer.id]: !prev[layer.id],
          })),
      })),
    [visibleLayers, layerVisibility]
  );

  const activeLayers = useMemo(
    () =>
      visibleLayers.filter((layer) => layerVisibility[layer.id] ?? layer.defaultVisible),
    [visibleLayers, layerVisibility]
  );

  return {
    layerToggles,
    activeLayers,
    layerVisibility,
  };
}
