
import { NextResponse } from 'next/server'
import { MapData, Observation, Transect, HistoricalData, BirdData } from "@/types/data";

async function getData(url: string) {
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "User-Agent": "Application",
      "X-ApiToken": process.env.FULCRUM_API_KEY || "",
    },
    next: { revalidate: 86400 },
  };

  const res = await fetch(url, options);

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  const data = await res.json();
  return data.rows;
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

interface Station {
  id: string;
  name: string;
  location: string;
  coords: {
    lat: number;
    lon: number;
  };
}

export async function GET() {
  const historicalSitesQuery = `
    SELECT
        *
    FROM
        "LOOKUP TABLE Long Term Sites Jallukar LCG"
  `;
  // color code by site_type
  // popup: show all other variables

  const squirrelGliderQuery = `
    SELECT
        _child_record_id AS observation_id,
        _parent_id AS parent_record_id,
        common_name,
        scientific_name,
        number_of_individuals,
        behaviour_notes,
        _latitude,
        _longitude,
        _geometry
    FROM
        "Project Platypus field crew logging/animals_observed"
    WHERE
        common_name = 'Squirrel Glider '
    ORDER BY
        _parent_id;
  `;

  const transectQuery = `
    SELECT
        *
    FROM
        "Project Platypus field crew logging"
    WHERE
        'Glider survey' = ANY(activity_type)
        AND is_this_a_day_or_night_survey = 'night'
        AND is_this_a_day_or_night_survey IS NOT NULL
  `;

  const baseUrl = "https://api.fulcrumapp.com/api/v2/query";
  const params =
    "format=json&headers=true&metadata=false&arrays=false&page=1&per_page=20000";

  const squirrel_glider_url = `${baseUrl}?q=${encodeURIComponent(
    squirrelGliderQuery
  )}&${params}`;
  const transect_url = `${baseUrl}?q=${encodeURIComponent(
    transectQuery
  )}&${params}`;
  const historical_url = `${baseUrl}?q=${encodeURIComponent(
    historicalSitesQuery
  )}&${params}`;

  const squirrel_glider_data: Observation[] = await getData(squirrel_glider_url);
  const transect_data: Transect[] = await getData(transect_url);
  const historical_data: HistoricalData[] = await getData(historical_url);

  const stationsQuery = `
    query StationsInBox(
      $ne: InputLocation!
      $sw: InputLocation!
    ) {
      stations(ne: $ne, sw: $sw) {
        nodes {
          id
          name
          location
          coords {
            lat
            lon
          }
        }
      }
    }
  `;

  const speciesQuery = `
    query DailySpeciesBreakdown(
      $stationId: [ID!]!
      $timePeriod: InputDuration
    ) {
      dailyDetectionCounts(
        stationIds: $stationId
        period: $timePeriod
      ) {
        date
        total
        counts {
          count
          species {
            id
            commonName
            scientificName
          }
        }
      }
    }
  `;

  const stationVariables = {
    ne: {
      lat: -36.87034,
      lon: 143.157963,
    },
    sw: {
      lat: -37.25989,
      lon: 142.428217,
    },
  };

  const stationsData = await postData(stationsQuery, stationVariables);
  const stations = stationsData.stations.nodes;

  const stationSpeciesPromises = stations.map((station: Station) => {
    const speciesVariables = {
      stationId: [station.id],
      timePeriod: { count: 1, unit: "day" },
    };
    return postData(speciesQuery, speciesVariables);
  });

  const speciesResults = await Promise.all(stationSpeciesPromises);

  const birdData: BirdData[] = stations.map((station: Station, index: number) => {
    const speciesData = speciesResults[index]?.dailyDetectionCounts[0];
    return {
      ...station,
      speciesData: speciesData || null,
    };
  });

  const data: MapData = {
    squirrel_glider_data,
    transect_data,
    historical_data,
    birdData,
  };

  return NextResponse.json(data)
}
