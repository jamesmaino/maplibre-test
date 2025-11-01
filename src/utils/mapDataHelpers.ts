import { LayerConfig } from "@/app/components/map/config/layerRegistry";

/**
 * Type-safe getter for layer data
 * Returns correctly typed data or undefined
 */
export function getLayerData<T>(
  mapData: Record<string, unknown>,
  layerConfig: LayerConfig<T>
): T | undefined {
  return mapData[layerConfig.id] as T | undefined;
}

/**
 * Check if layer has data
 */
export function hasLayerData<T>(
  mapData: Record<string, unknown>,
  layerConfig: LayerConfig<T>
): boolean {
  const data = mapData[layerConfig.id];
  return data !== undefined && data !== null &&
    (Array.isArray(data) ? data.length > 0 : true);
}
