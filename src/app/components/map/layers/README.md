# Map Layers Architecture

This document explains the layer plugin architecture used in this application.

## Table of Contents

- [Overview](#overview)
- [Layer Types](#layer-types)
- [Layer Structure](#layer-structure)
- [Data Flow](#data-flow)
- [Creating a New Layer](#creating-a-new-layer)
- [Examples](#examples)

---

## Overview

Layers are self-contained, pluggable components that handle:
- Data fetching (via API)
- Data transformation
- Rendering on the map
- User interactions (clicks, tooltips, popups)

All layers follow a **consistent architectural pattern** with numbered sections:
1. Type Definitions
2. Data Transformation (if applicable)
3. Child Components (if applicable)
4. Main Layer Component
5. Layer Configuration

---

## Layer Types

### 1. API-Driven Layers (with `dataSource`)

Layers that fetch data from external APIs (Fulcrum, GraphQL, REST).

**Examples:**
- `BirdFeedLayer` - GraphQL API
- `WeedSurveyLayer` - Fulcrum API with template variables
- `SquirrelGliderLayer` - Fulcrum API
- `TransectLayer` - Fulcrum API
- `HistoricalSitesLayer` - Fulcrum API

**Characteristics:**
- Have a `dataSource` configuration
- Include a `transform` function to convert raw API data
- Data is fetched server-side via `/api/data`
- Component receives transformed data as props

### 2. Tile-Based Layers (without `dataSource`)

Layers that use pre-existing tile sources (vector tiles, raster tiles).

**Examples:**
- `VegetationLayer` - Vector tiles from PMTiles
- `INaturalistLayer` - Raster tiles from iNaturalist

**Characteristics:**
- No `dataSource` configuration
- Data comes from map style or external tile server
- Render immediately without API calls
- Use `RLayer` with a `source` that's already in the map

---

## Layer Structure

### Standard File Organization

```
LayerName/
  └── index.tsx
```

### Code Structure Template

```typescript
import { RSource, RLayer } from "maplibre-react-components";
import { LayerComponentProps, LayerConfig } from "../../config/layerRegistry";

// ==========================================
// 1. Type Definitions
// ==========================================

export interface YourDataType {
  id: string;
  // ... other fields
}

// ==========================================
// 2. Data Transformation
// ==========================================

function transformToYourType(data: any[]): YourDataType[] {
  return data.map((row) => ({
    id: row.id,
    // ... map other fields
  }));
}

// ==========================================
// 3. Child Components (optional)
// ==========================================

function ChildComponent({ ... }) {
  // Component logic
}

// ==========================================
// 4. Main Layer Component
// ==========================================

function YourLayerComponent({ data, onPopupOpen, layerId }: LayerComponentProps<YourDataType[]>) {
  return (
    <>
      {/* Render map elements */}
    </>
  );
}

// ==========================================
// 5. Layer Configuration
// ==========================================

export const yourLayer: LayerConfig<YourDataType[]> = {
  id: "yourLayerId",
  name: "Display Name",
  defaultVisible: true,
  Component: YourLayerComponent,
  dataSource: {
    type: "fulcrum", // or "graphql" or "rest"
    requiresAuth: "admin", // or "user" or "public"
    query: `...`,
    transform: transformToYourType,
  },
  shouldShow: (data) => data.length > 0, // optional
};
```

---

## Data Flow

### For API-Driven Layers

```
1. User toggles layer ON
2. Map component calls /api/data?layers=yourLayerId
3. API route fetches data from external source (Fulcrum/GraphQL)
4. API route applies template variables (if any)
5. API route runs transform function
6. Transformed data returned to client
7. useLayerRegistry filters visible layers with loaded data
8. Component receives data prop and renders
```

### For Tile-Based Layers

```
1. User toggles layer ON
2. useLayerRegistry includes layer immediately (no data fetch)
3. Component renders using existing map sources
4. Map loads tiles as needed
```

---

## Creating a New Layer

### Step 1: Create the Layer File

```bash
mkdir src/app/components/map/layers/YourLayer
touch src/app/components/map/layers/YourLayer/index.tsx
```

### Step 2: Implement the Layer

Choose the appropriate template based on your data source:

#### Option A: API-Driven Layer (Fulcrum)

```typescript
import { RSource, RLayer } from "maplibre-react-components";
import { LayerComponentProps, LayerConfig } from "../../config/layerRegistry";
import { getLayerIds } from "../../config/layerRegistry";
import { FeatureCollection } from "geojson";

// 1. Define your data type
export interface YourData {
  _record_id: string;
  _geometry: any;
  // ... other fields
}

// 2. Transform to GeoJSON
function transformToGeoJSON(data: YourData[]): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: data.map((item) => ({
      type: "Feature",
      properties: { ...item },
      geometry: item._geometry,
    })),
  };
}

// 3. Component
function YourComponent({ data, onPopupOpen, layerId }: LayerComponentProps<FeatureCollection>) {
  const ids = getLayerIds(layerId);

  return (
    <>
      <RSource id={ids.source} type="geojson" data={data} />
      <RLayer
        id={ids.fill}
        source={ids.source}
        type="fill"
        paint={{ "fill-color": "#ff0000" }}
        onClick={(e) => {
          onPopupOpen({
            longitude: e.lngLat.lng,
            latitude: e.lngLat.lat,
            properties: e.features?.[0]?.properties,
          });
        }}
      />
    </>
  );
}

// 4. Configuration
export const yourLayer: LayerConfig<FeatureCollection> = {
  id: "yourLayer",
  name: "Your Layer",
  defaultVisible: false,
  Component: YourComponent,
  dataSource: {
    type: "fulcrum",
    requiresAuth: "admin",
    query: `SELECT * FROM "Your Table"`,
    transform: transformToGeoJSON,
  },
  shouldShow: (data) => data.features.length > 0,
};
```

#### Option B: Marker-Based Layer

```typescript
import { RMarker } from "maplibre-react-components";
import { LayerComponentProps, LayerConfig } from "../../config/layerRegistry";

export interface MarkerData {
  id: string;
  _latitude: number;
  _longitude: number;
  name: string;
}

function transformToMarkers(data: any[]): MarkerData[] {
  return data.map((row) => ({
    id: row.id,
    _latitude: row._latitude,
    _longitude: row._longitude,
    name: row.name,
  }));
}

function YourMarkerComponent({ data, onPopupOpen }: LayerComponentProps<MarkerData[]>) {
  return (
    <>
      {data.map((point) => (
        <RMarker
          key={point.id}
          longitude={point._longitude}
          latitude={point._latitude}
          onClick={(e) => {
            e.stopPropagation();
            onPopupOpen({
              longitude: point._longitude,
              latitude: point._latitude,
              properties: point,
            });
          }}
        >
          <div style={{ cursor: "pointer" }}>📍</div>
        </RMarker>
      ))}
    </>
  );
}

export const yourMarkerLayer: LayerConfig<MarkerData[]> = {
  id: "yourMarkers",
  name: "Your Markers",
  defaultVisible: true,
  Component: YourMarkerComponent,
  dataSource: {
    type: "fulcrum",
    requiresAuth: "user",
    query: `SELECT * FROM "Your Table"`,
    transform: transformToMarkers,
  },
  shouldShow: (data) => data.length > 0,
};
```

#### Option C: Tile-Based Layer (No API)

```typescript
import { RSource, RLayer } from "maplibre-react-components";
import { LayerComponentProps, LayerConfig } from "../../config/layerRegistry";

function YourTileComponent({ layerId }: LayerComponentProps) {
  const sourceId = `${layerId}-source`;

  return (
    <>
      <RSource
        id={sourceId}
        type="raster"
        tiles={["https://your-tile-server/{z}/{x}/{y}.png"]}
        tileSize={256}
      />
      <RLayer
        id={layerId}
        type="raster"
        source={sourceId}
        paint={{ "raster-opacity": 0.7 }}
      />
    </>
  );
}

export const yourTileLayer: LayerConfig = {
  id: "yourTiles",
  name: "Your Tiles",
  defaultVisible: true,
  Component: YourTileComponent,
  // Note: No dataSource - uses tiles directly
};
```

### Step 3: Register the Layer

Add your layer to `src/app/components/map/config/layerRegistry.ts`:

```typescript
import { yourLayer } from "../layers/YourLayer";

export const LAYER_REGISTRY: LayerConfig[] = [
  vegetationLayer,
  iNaturalistLayer,
  birdFeedLayer,
  yourLayer, // Add here
  // ... other layers
];
```

### Step 4: Test

1. Start the dev server: `npm run dev`
2. Look for your layer in the layer controls
3. Toggle it on/off to verify it works
4. Click on features to test popups (if applicable)

---

## Examples

### Example 1: Simple Polygon Layer

See `TransectLayer` - fetches polygons from Fulcrum, transforms to GeoJSON, renders with fill and stroke.

### Example 2: Marker Layer with Custom Icons

See `SquirrelGliderLayer` - fetches point data, renders custom SVG markers, opens popups on click.

### Example 3: Complex GraphQL Layer

See `BirdFeedLayer` - fetches from GraphQL, makes additional API calls in transform, renders markers with dynamic styling.

### Example 4: Vector Tile Layer

See `VegetationLayer` - uses vector tiles from map style, implements hover tooltips with delayed display.

### Example 5: Raster Tile Layer

See `INaturalistLayer` - displays external raster tiles with opacity control.

---

## Best Practices

### 1. Type Safety
- Always define explicit interfaces for your data types
- Use generic types on `LayerConfig<TData>` and `LayerComponentProps<TData>`

### 2. Performance
- Use `useMemo` for expensive calculations
- Use `memo` for child components that render frequently
- Keep transform functions pure and efficient

### 3. User Context & Security
- Use `requiresAuth` to control access: `"admin"`, `"user"`, or `"public"`
- Use `templateVars` to inject user-specific data into queries
- Never expose sensitive data in client-side code

### 4. Consistency
- Follow the numbered section structure
- Use `getLayerIds(layerId)` for generating layer/source IDs
- Add comments explaining any unusual logic

### 5. Error Handling
- Use `shouldShow` to hide layers with empty data
- Handle null/undefined data gracefully
- Provide meaningful error messages in transform functions

---

## Advanced Features

### Template Variables (Fulcrum Queries)

Inject user-specific values into SQL queries:

```typescript
dataSource: {
  type: "fulcrum",
  query: `
    SELECT * FROM "Table_{{landcareGroup}}"
    WHERE date >= '{{startDate}}'
  `,
  templateVars: (ctx: UserContext) => ({
    landcareGroup: ctx.user.landcareGroup,
    startDate: getStartDate(ctx.user.group),
  }),
}
```

### GraphQL Variables

Pass complex objects to GraphQL queries:

```typescript
dataSource: {
  type: "graphql",
  query: `
    query GetData($bounds: BoundsInput!) {
      data(bounds: $bounds) { ... }
    }
  `,
  templateVars: (ctx: UserContext) => ({
    bounds: {
      ne: { lat: -36.87, lon: 143.16 },
      sw: { lat: -37.26, lon: 142.43 },
    },
  }),
}
```

### Conditional Rendering

Control when layers appear:

```typescript
shouldShow: (data) => {
  // Only show if there's data and it meets criteria
  return data.features.length > 0 && data.features.some(f => f.properties.important);
}
```

---

## Troubleshooting

### Layer not appearing?

1. Check `defaultVisible` is `true` or toggle it on in controls
2. Check `shouldShow` condition isn't filtering it out
3. Verify data is being fetched (check Network tab)
4. Ensure layer is registered in `LAYER_REGISTRY`

### Data not loading?

1. Check API route `/api/data` for errors
2. Verify authentication requirements
3. Check `transform` function isn't throwing errors
4. Look for errors in server console

### Popups not working?

1. Ensure `onPopupOpen` is being called
2. Check popup coordinates are valid
3. Verify `MapPopup` component is rendered in `Map.tsx`

---

## Related Files

- `src/app/components/map/config/layerRegistry.ts` - Central registry
- `src/hooks/useLayerRegistry.tsx` - Layer visibility & data management
- `src/app/api/data/route.ts` - Server-side data fetching
- `src/app/components/map/Map.tsx` - Main map component
- `src/app/components/map/MapControls.tsx` - Layer toggle controls
