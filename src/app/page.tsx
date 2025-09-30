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
  console.log(data);
  return data.rows;
}

export default async function Home() {
  const squirrel_glider_url =
    "https://api.fulcrumapp.com/api/v2/query?q=SELECT%20%20%20%20%20_child_record_id%20AS%20observation_id%2C%20%20%20%20%20_parent_id%20AS%20parent_record_id%2C%20%20%20%20%20common_name%2C%20%20%20%20%20scientific_name%2C%20%20%20%20%20number_of_individuals%2C%20%20%20%20%20behaviour_notes%2C%20%20%20%20%20_latitude%2C%20%20%20%20%20_longitude%2C%20%20%20%20%20_geometry%20FROM%20%20%20%20%20%22Project%20Platypus%20field%20crew%20logging%2Fanimals_observed%22%20WHERE%20%20%20%20%20common_name%20%3D%20%27Squirrel%20Glider%20%27%20ORDER%20BY%20%20%20%20%20_parent_id%3B&format=json&headers=true&metadata=false&arrays=false&page=1&per_page=20000";
  const transect_url =
    "https://api.fulcrumapp.com/api/v2/query?q=SELECT%20%20%20%20%20%2A%20FROM%20%20%20%20%20%22Project%20Platypus%20field%20crew%20logging%22%20WHERE%20%20%20%20%27Glider%20survey%27%20%3D%20ANY%28activity_type%29%20AND%20is_this_a_day_or_night_survey%20%3D%20%27night%27%20%20%20%20%20AND%20is_this_a_day_or_night_survey%20IS%20NOT%20NULL&format=json&headers=true&metadata=false&arrays=false&page=1&per_page=20000";

  const squirrel_glider_data = await getData(squirrel_glider_url);
  const transect_data = await getData(transect_url);
  const data = { squirrel_glider_data, transect_data };
  return (
    <main>
      <ClientMap data={data} />
    </main>
  );
}
