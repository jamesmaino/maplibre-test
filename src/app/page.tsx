import ClientMap from "./components/ClientMap";

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

export default async function Home() {
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

  const squirrel_glider_data = await getData(squirrel_glider_url);
  const transect_data = await getData(transect_url);
  const historical_data = await getData(historical_url);
  console.log(historical_data);

  const data = { squirrel_glider_data, transect_data, historical_data };
  return (
    <main>
      <ClientMap data={data} />
    </main>
  );
}
