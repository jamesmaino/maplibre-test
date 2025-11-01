
import { ComponentType } from "react";
import { Session } from "next-auth";
import { weedSurveyLayer } from "../layers/WeedSurveyLayer";
import { vegetationLayer } from "../layers/VegetationLayer";
import { birdFeedLayer } from "../layers/BirdFeedLayer";
import { squirrelGliderLayer } from "../layers/SquirrelGliderLayer";
import { transectLayer } from "../layers/TransectLayer";
import { historicalSitesLayer } from "../layers/HistoricalSitesLayer";
import { iNaturalistLayer } from "../layers/INaturalistLayer";

export interface UserContext {
  user: {
    name?: string;
    email?: string;
    group?: string;
    landcareGroup?: string;
  };
  session: Session;
}

export interface LayerConfig<TData = any> {
  id: string;
  name: string;

  // Data source configuration
  dataSource?: {
    type: "fulcrum" | "graphql";
    requiresAuth?: "admin" | "user" | "public";

    // Query with {{variable}} template syntax (Fulcrum) or GraphQL query
    query: string;

    // Extract template variables from user context
    // For Fulcrum: returns Record<string, string> for template replacement
    // For GraphQL: returns Record<string, any> for GraphQL variables
    templateVars?: (userContext: UserContext) => Record<string, any>;

    // Transform raw API response
    transform?: (rawData: any) => TData | Promise<TData>;
  };

  // Component (can be lazy-loaded)
  Component: ComponentType<LayerComponentProps<TData>>;

  // Conditional rendering
  shouldShow?: (data: TData) => boolean;
}

export interface LayerComponentProps<TData = any> {
  data: TData;
  onPopupOpen: (info: PopupInfo) => void;
  layerId: string; // For generating unique layer IDs
}

export interface PopupInfo {
  longitude: number;
  latitude: number;
  properties: any;
  type?: "bird" | "default";
}

export interface PageLayerConfig {
  layer: LayerConfig;
  defaultVisible: boolean;
}

/**
 * Nested Layer Registry - Organized by Page
 *
 * Three main pages:
 * - biolinks: Main map with bird, wildlife, and ecological data
 * - weeds: Weed management focus
 * - heritage: Historical sites focus
 */
export const LAYER_REGISTRY: Record<string, readonly PageLayerConfig[]> = {
  // BioLinks - main ecological monitoring page
  biolinks: [
    { layer: vegetationLayer, defaultVisible: true },
    { layer: iNaturalistLayer, defaultVisible: true },
    { layer: birdFeedLayer, defaultVisible: true },
    { layer: squirrelGliderLayer, defaultVisible: true },
    { layer: transectLayer, defaultVisible: false },
    { layer: historicalSitesLayer, defaultVisible: false },
  ],

  // Weed management page
  weeds: [
    { layer: vegetationLayer, defaultVisible: true },
    { layer: weedSurveyLayer, defaultVisible: true },
  ],

  // Heritage/historical sites page
  heritage: [
    { layer: vegetationLayer, defaultVisible: true },
    { layer: historicalSitesLayer, defaultVisible: true },
  ],
} as const;

/**
 * Helper function to get layers for a specific page
 * @param pageId - The page identifier (defaults to 'biolinks')
 * @returns Array of PageLayerConfig for the specified page
 */
export function getLayersForPage(
  pageId: keyof typeof LAYER_REGISTRY = "biolinks"
): readonly PageLayerConfig[] {
  return LAYER_REGISTRY[pageId] || LAYER_REGISTRY.biolinks;
}

/**
 * Get a specific layer by its ID (searches across all pages)
 * @param layerId - The layer ID to find
 * @returns LayerConfig or undefined if not found
 */
export function getLayerById(layerId: string): LayerConfig | undefined {
  for (const page of Object.values(LAYER_REGISTRY)) {
    const pageLayer = page.find((l) => l.layer.id === layerId);
    if (pageLayer) return pageLayer.layer;
  }
  return undefined;
}

/**
 * Get multiple layers by their IDs
 * @param layerIds - Array of layer IDs
 * @returns Array of found LayerConfig objects
 */
export function getLayersByIds(layerIds: string[]): LayerConfig[] {
  return layerIds
    .map(id => getLayerById(id))
    .filter((layer): layer is LayerConfig => layer !== undefined);
}

/**
 * Generate consistent layer IDs from base layer ID
 */
export function getLayerIds(layerId: string) {
  return {
    source: `${layerId}-source`,
    fill: `${layerId}-fill`,
    line: `${layerId}-line`,
    marker: `${layerId}-marker`,
  };
}
