
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getLayersByIds,
  UserContext,
  LayerConfig,
} from "@/app/components/map/config/layerRegistry";
import { applyTemplate } from "@/utils/queryTemplates";

async function fetchFulcrumData(query: string) {
  const baseUrl = "https://api.fulcrumapp.com/api/v2/query";
  const params =
    "format=json&headers=true&metadata=false&arrays=false&page=1&per_page=20000";
  const url = `${baseUrl}?q=${encodeURIComponent(query)}&${params}`;

  // Disable cache in development, cache for 24 hours in production
  const revalidate = process.env.NODE_ENV === 'development' ? 0 : 86400;

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

async function fetchGraphQLData(query: string, variables: object) {
    // Disable cache in development, cache for 24 hours in production
    const revalidate = process.env.NODE_ENV === 'development' ? 0 : 86400;

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

function checkAuth(
  required: "admin" | "user" | "public" | undefined,
  ctx: UserContext
): boolean {
  if (!required || required === "public") return true;
  if (required === "user") return !!ctx.session.user;
  if (required === "admin") return ctx.user?.group === "admin";
  return false;
}

/**
 * Fetch data for a single layer
 */
async function fetchLayerData(
  layer: LayerConfig,
  userContext: UserContext
): Promise<{ id: string; data: any } | { id: string; error: string }> {
  try {
    // Skip layers without data source
    if (!layer.dataSource) {
      return { id: layer.id, data: [] };
    }

    // Check auth requirements
    if (!checkAuth(layer.dataSource.requiresAuth, userContext)) {
      return { id: layer.id, error: "Unauthorized" };
    }

    // Apply template variables to query
    let queryStr = layer.dataSource.query;
    let variables = {};
    if (layer.dataSource.templateVars) {
      variables = layer.dataSource.templateVars(userContext);
      // Only apply string template replacement for Fulcrum queries
      if (layer.dataSource.type === "fulcrum") {
        queryStr = applyTemplate(queryStr, variables as Record<string, string>);
      }
    }

    // Fetch data based on source type
    console.log(`Fetching ${queryStr}`)

    let rawData: any;
    if (layer.dataSource.type === "fulcrum") {
      rawData = await fetchFulcrumData(queryStr);
    } else if (layer.dataSource.type === "graphql") {
        rawData = await fetchGraphQLData(layer.dataSource.query, variables);
    }
    // Add other source types here (rest, etc.)

    // Transform data if transformer provided
    const transformedData = layer.dataSource.transform
      ? await layer.dataSource.transform(rawData)
      : rawData;

    return { id: layer.id, data: transformedData };
  } catch (error) {
    console.error(`Error fetching data for layer ${layer.id}:`, error);
    return {
      id: layer.id,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * GET /api/data?layers=weedSurveys&layers=fauna
 *
 * Fetches data for specified layers only (prevents over-fetching)
 * Executes all fetches in parallel (improves performance)
 * Gracefully handles failures (returns partial data + errors)
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Build user context
  const userContext: UserContext = {
    user: {
      name: session.user.name ?? undefined,
      email: session.user.email ?? undefined,
      group: session.user.group ?? undefined,
      landcareGroup: session.user.landcareGroup || "Halls Gap LCG",
    },
    session,
  };

  // 🚀 PERFORMANCE: Only fetch requested layers
  const { searchParams } = request.nextUrl;
  const requestedLayerIds = searchParams.getAll("layers");

  // Return empty if no layers requested
  if (requestedLayerIds.length === 0) {
    return NextResponse.json({ data: {}, errors: {} });
  }

  // Get only the requested layers by their IDs
  const layersToFetch = getLayersByIds(requestedLayerIds);

  if (layersToFetch.length === 0) {
    return NextResponse.json({ data: {}, errors: {} });
  }

  // 🚀 PERFORMANCE: Fetch all layers in parallel
  const results = await Promise.all(
    layersToFetch.map((layer) => fetchLayerData(layer, userContext))
  );

  // 🛡️ RESILIENCY: Separate successful data from errors
  const data: Record<string, any> = {};
  const errors: Record<string, string> = {};

  for (const result of results) {
    if ("data" in result) {
      data[result.id] = result.data;
    } else if ("error" in result) {
      errors[result.id] = result.error;
    }
  }

  // Return both successful data and errors
  // Client can decide how to handle partial failures
  return NextResponse.json({ data, errors });
}
