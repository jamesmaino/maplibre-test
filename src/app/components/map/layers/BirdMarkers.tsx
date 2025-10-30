import { RMarker } from "maplibre-react-components";
import PucMarker from "../markers/PucMarker";
import * as Colors from "../../shared/constants/Colors";
import { BirdData } from "../../../../types/data";
import { getUniqueSpeciesCount } from "../../../../utils/mapCalculations";

interface BirdMarkersProps {
  data: BirdData[];
  maxSpecies: number;
  onMarkerClick: (station: BirdData) => void;
}

/**
 * Renders bird station markers on the map
 */
export function BirdMarkers({
  data,
  maxSpecies,
  onMarkerClick,
}: BirdMarkersProps) {
  return (
    <>
      {data.map((station) => {
        const uniqueSpeciesCount = getUniqueSpeciesCount(station);

        return (
          <RMarker
            key={station.id}
            longitude={station.coords.lon}
            latitude={station.coords.lat}
            onClick={(e) => {
              e.stopPropagation();
              onMarkerClick(station);
            }}
          >
            <PucMarker
              speciesCount={uniqueSpeciesCount}
              baseColor={Colors.foreground4}
              opacity={Colors.foreground_opacity}
              upper={maxSpecies}
            />
          </RMarker>
        );
      })}
    </>
  );
}
