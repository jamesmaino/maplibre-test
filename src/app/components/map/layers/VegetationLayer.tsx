import TooltipLayer from "./TooltipLayer";
import { LayerComponentProps } from "../config/layerRegistry";

/**
 * Vegetation/protomaps layer with tooltips
 */
export function VegetationLayer({ data, onPopupOpen }: LayerComponentProps) {
  // TooltipLayer manages its own popup state internally
  // We pass null here as it doesn't use the shared popup
  return <TooltipLayer popupInfo={null} />;
}
