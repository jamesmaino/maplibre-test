import { useMemo } from "react";
import { RLayer } from "maplibre-react-components";
import { BirdMarkers } from "./BirdMarkers";
import { LayerComponentProps } from "../config/layerRegistry";
import { LAYER_IDS } from "../config/mapConstants";
import { calculateMaxSpecies } from "../../../../utils/mapCalculations";

/**
 * Renders bird feed layers (iNaturalist raster + bird station markers)
 */
export function BirdFeedLayers({ data, onPopupOpen }: LayerComponentProps) {
  const maxSpecies = useMemo(
    () => calculateMaxSpecies(data.birdData),
    [data.birdData]
  );

  const handleBirdMarkerClick = (station: any) => {
    const uniqueSpeciesCount = station.speciesData?.counts?.length || 0;
    const sortedSpecies = station.speciesData?.counts
      ?.slice()
      .sort((a: any, b: any) => b.count - a.count) || [];

    onPopupOpen({
      longitude: station.coords.lon,
      latitude: station.coords.lat,
      type: "bird",
      properties: {
        station_name: station.name,
        unique_species: uniqueSpeciesCount,
        total_detections: station?.speciesData?.total ?? null,
        date: station?.speciesData?.date ?? null,
        species_list: sortedSpecies,
      },
    });
  };

  return (
    <>
      <RLayer
        id={LAYER_IDS.INATURALIST}
        type="raster"
        source={LAYER_IDS.INATURALIST_SOURCE}
        paint={{ "raster-opacity": 0.7 }}
      />
      <BirdMarkers
        data={data.birdData}
        maxSpecies={maxSpecies}
        onMarkerClick={handleBirdMarkerClick}
      />
    </>
  );
}
