interface SpeciesCount {
  count: number;
  species: {
    id: string;
    commonName: string;
    scientificName: string;
  };
}

/**
 * Sorts species by detection count (highest to lowest)
 */
export function sortSpeciesByCount(
  counts: SpeciesCount[] | undefined
): SpeciesCount[] {
  if (!counts) return [];
  return [...counts].sort((a, b) => b.count - a.count);
}
