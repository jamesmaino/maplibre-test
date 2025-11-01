
export async function fetchFulcrumData(query: string) {
  const baseUrl = "https://api.fulcrumapp.com/api/v2/query";
  const params =
    "format=json&headers=true&metadata=false&arrays=false&page=1&per_page=20000";
  const url = `${baseUrl}?q=${encodeURIComponent(query)}&${params}`;

  // Disable cache in development, cache for 24 hours in production
  const revalidate = process.env.NODE_ENV === 'development' ? 300 : 86400;

  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "User-Agent": "Application",
      "X-ApiToken": process.env.FULCRUM_API_KEY || "",
    },
    next: { revalidate },
  };

  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Fulcrum API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.rows;
}
