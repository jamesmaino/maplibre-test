import { BirdData } from "../types/data";

/**
 * Calculates the maximum unique species count across all bird stations
 */
export function calculateMaxSpecies(birdData: BirdData[]): number {
  return (
    Math.max(
      ...(birdData.map(
        (station) => station?.speciesData?.counts?.length ?? 0
      ) || [])
    ) || 0
  );
}

/**
 * Gets unique species count for a single station
 */
export function getUniqueSpeciesCount(station: BirdData): number {
  return station.speciesData?.counts?.length || 0;
}
