// Generic map data - layers are keyed by layer ID
export type MapData = Record<string, any>;

// For type safety, you can extend with known layers:
export interface TypedMapData extends Record<string, any> {
  birdData?: any[]; // Replace with more specific type if available
  weedSurveys?: any[]; // Replace with more specific type if available
  vegetation?: any[]; // Replace with more specific type if available
  // Add other known layers as needed
}