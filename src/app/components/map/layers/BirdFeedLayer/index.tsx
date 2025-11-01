import { useMemo, memo } from "react";
import { RMarker } from "maplibre-react-components";
import {
  LayerComponentProps,
  LayerConfig,
} from "../../config/layerRegistry";
import * as Colors from "../../../shared/constants/Colors";

// ==========================================
// 1. Type Definitions
// ==========================================

export interface BirdData {
  id: string;
  name: string;
  location: string | null;
  coords: {
    lat: number;
    lon: number;
  };
  speciesData: {
    date: string;
    total: number;
    counts: {
      count: number;
      species: {
        id: string;
        commonName: string;
        scientificName: string;
      };
    }[];
  } | null;
}

// ==========================================
// 2. Data Transformation & Helpers
// ==========================================

function calculateMaxSpecies(birdData: BirdData[]): number {
  return (
    Math.max(
      ...(birdData.map(
        (station) => station?.speciesData?.counts?.length ?? 0
      ) || [])
    ) || 0
  );
}

function getUniqueSpeciesCount(station: BirdData): number {
  return station.speciesData?.counts?.length || 0;
}

async function postData(query: string, variables: object) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    next: { revalidate: 86400 }, // Revalidate once a day
  };

  const res = await fetch("https://app.birdweather.com/graphql", options);

  if (!res.ok) {
    throw new Error("Failed to fetch data from BirdWeather API");
  }

  const data = await res.json();
  return data.data;
}

// ==========================================
// 3. Child Components
// ==========================================

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s,
    l = (max + min) / 2;
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
};

const PucMarker = memo(
  ({ speciesCount, baseColor, opacity = 1, upper }: any) => {
    const getColorWithLightness = ({ speciesCount, baseColor, upper }: any) => {
      if (speciesCount <= 0) return "transparent";
      const ratio = Math.min(speciesCount / upper, 1);
      const r = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);
      const [h, s, l_original] = rgbToHsl(r, g, b);
      const MIN_LIGHTNESS = 15;
      const finalLightness =
        MIN_LIGHTNESS + (l_original - MIN_LIGHTNESS) * ratio;
      return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(
        finalLightness
      )}%)`;
    };

    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 100 100"
        style={{ cursor: "pointer" }}
      >
        <path
          stroke="black"
          strokeWidth={5}
          strokeOpacity={opacity}
          opacity={opacity}
          fill={getColorWithLightness({
            speciesCount,
            baseColor,
            upper,
            opacity,
          })}
          d="M41.284,16.77c-6.892-8.522-22.535-8.018-31.278,3.399c-1.577,2.059-2.811,4.729-3.743,7.761l-5.836,2.436l4.57,2.841  c-2.102,11.536-0.88,25.768,2.064,32.698c9.018,21.227,38.185,27.266,55.113,20.588c24.564-9.692,37.398-29.309,37.398-29.309  S70.898,56.879,41.284,16.77z M21.102,26.478c-0.336,1.649-2.192,2.682-4.146,2.305c-1.954-0.376-3.266-2.019-2.93-3.668  c0.335-1.649,2.192-2.682,4.146-2.306C20.126,23.186,21.437,24.828,21.102,26.478z M78.92,65.088  c-2.406,6.359-13.541,8.04-24.867,3.754C42.726,64.556,35.494,55.926,37.9,49.565c2.406-6.36,13.54-8.041,24.868-3.754  C74.094,50.097,81.326,58.728,78.92,65.088z"
        ></path>
      </svg>
    );
  }
);
PucMarker.displayName = "PucMarker";

function BirdMarkers({
  data,
  maxSpecies,
  onMarkerClick,
}: {
  data: BirdData[];
  maxSpecies: number;
  onMarkerClick: (station: BirdData) => void;
}) {
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

// ==========================================
// 4. Main Layer Component
// ==========================================

function BirdFeedComponent({
  data,
  onPopupOpen,
}: LayerComponentProps<BirdData[]>) {
  const maxSpecies = useMemo(() => calculateMaxSpecies(data), [data]);

  const handleBirdMarkerClick = (station: any) => {
    const uniqueSpeciesCount = station.speciesData?.counts?.length || 0;
    const sortedSpecies =
      station.speciesData?.counts
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
    <BirdMarkers
      data={data}
      maxSpecies={maxSpecies}
      onMarkerClick={handleBirdMarkerClick}
    />
  );
}

// ==========================================
// 5. Layer Configuration
// ==========================================

export const birdFeedLayer: LayerConfig<BirdData[]> = {
  id: "birdData",
  name: "Bird Feed",
  Component: BirdFeedComponent,
  dataSource: {
    type: "graphql",
    query: `
            query StationsInBox {
                stations(ne: {lat: -36.87034, lon: 143.157963}, sw: {lat: -37.25989, lon: 142.428217}) {
                    nodes { id name location coords { lat lon } }
                }
            }
        `,
    transform: async (data: any) => {
      const stations = data.stations.nodes;
      const speciesQuery = `
                query DailySpeciesBreakdown($stationId: [ID!]!, $timePeriod: InputDuration) {
                    dailyDetectionCounts(stationIds: $stationId, period: $timePeriod) {
                        date total counts { count species { id commonName scientificName } }
                    }
                }
            `;

      const stationSpeciesPromises = stations.map((station: any) => {
        const speciesVariables = {
          stationId: [station.id],
          timePeriod: { count: 1, unit: "day" },
        };
        return postData(speciesQuery, speciesVariables);
      });

      const speciesResults = await Promise.all(stationSpeciesPromises);

      return stations.map((station: any, index: number) => ({
        ...station,
        speciesData: speciesResults[index]?.dailyDetectionCounts[0] || null,
      }));
    },
  },
};
