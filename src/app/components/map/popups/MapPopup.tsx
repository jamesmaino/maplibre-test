import { RPopup } from "maplibre-react-components";
import BirdPopup from "./BirdPopup";
import { DefaultPopup } from "./DefaultPopup";
import { PopupInfo } from "../config/layerRegistry";

interface MapPopupProps {
  popupInfo: PopupInfo | null;
  onClose: () => void;
}

/**
 * Renders the appropriate popup based on popup type
 */
export function MapPopup({ popupInfo, onClose }: MapPopupProps) {
  if (!popupInfo) return null;

  return (
    <RPopup
      className="text-black"
      longitude={popupInfo.longitude}
      latitude={popupInfo.latitude}
      onMapMove={onClose}
      onMapClick={onClose}
    >
      <div className="p-2 text-xs">
        {popupInfo.type === "bird" ? (
          <BirdPopup
            stationName={popupInfo.properties.station_name}
            date={popupInfo.properties.date}
            uniqueSpecies={popupInfo.properties.unique_species}
            totalDetections={popupInfo.properties.total_detections}
            speciesList={popupInfo.properties.species_list || []}
          />
        ) : (
          <DefaultPopup properties={popupInfo.properties} />
        )}
      </div>
      <button
        className=" maplibregl-popup-close-button flex items-center text-lg py-1 px-2"
        onClick={onClose}
      >
        ×
      </button>
    </RPopup>
  );
}
