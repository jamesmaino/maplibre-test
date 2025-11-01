
export async function fetchGraphQLData(query: string, variables: object) {
    // Disable cache in development, cache for 24 hours in production
    const revalidate = process.env.NODE_ENV === 'development' ? 300 : 86400;

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
        next: { revalidate },
    };

    // This is hardcoded for BirdWeather API, but could be made generic
    const res = await fetch("https://app.birdweather.com/graphql", options);

    if (!res.ok) {
        throw new Error("Failed to fetch data from GraphQL API");
    }

    const data = await res.json();
    return data.data;
}
