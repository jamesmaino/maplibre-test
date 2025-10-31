
import { useState, useMemo, useEffect } from "react";
import { getLayersForPage, LayerConfig, PopupInfo } from "../app/components/map/config/layerRegistry";
import { MapData } from "@/types/data";

export function useLayerRegistry(
  onPopupOpen: (info: PopupInfo) => void,
  pageId: 'biolinks' | 'weeds' | 'heritage' = 'biolinks'
) {
  // Get layers for this specific page
  const layers = useMemo(() => getLayersForPage(pageId), [pageId]);

  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>(
    () =>
      layers.reduce(
        (acc, layer) => ({
          ...acc,
          [layer.id]: layer.defaultVisible,
        }),
        {}
      )
  );

  const [mapData, setMapData] = useState<MapData>({});

  useEffect(() => {
    const layerIds = layers.filter(layer => layer.dataSource).map(layer => layer.id);

    // If no layers need data, skip the fetch
    if (layerIds.length === 0) {
      setMapData({});
      return;
    }

    const query = layerIds.map(id => `layers=${id}`).join('&');

    fetch(`/api/data?${query}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        setMapData(data.data || {});
      })
      .catch(error => {
        console.error('Failed to fetch layer data:', error);
        setMapData({});
      });
  }, [layers]);

  const layerToggles = useMemo(
    () =>
      layers.map((layer) => ({
        id: layer.id,
        name: layer.name,
        isVisible: layerVisibility[layer.id] ?? layer.defaultVisible,
        toggle: () =>
          setLayerVisibility((prev) => ({
            ...prev,
            [layer.id]: !prev[layer.id],
          })),
      })),
    [layers, layerVisibility]
  );

  const activeLayers = useMemo(() => {
    return layers.filter(layer => layerVisibility[layer.id])
                 .filter(layer => {
                   // Layers without dataSource don't need API data (e.g., vector tile layers)
                   if (!layer.dataSource) return true;

                   // Only render layers that have data loaded
                   const layerData = mapData[layer.id];
                   if (!layerData) return false;

                   // Check if shouldShow condition is met (if defined)
                   if (layer.shouldShow && !layer.shouldShow(layerData)) return false;

                   return true;
                 })
                 .map(layer => {
                   const layerData = mapData[layer.id];
                   return {
                     id: layer.id,
                     Component: layer.Component,
                     props: {
                       data: layerData,
                       onPopupOpen,
                       layerId: layer.id
                     }
                   };
                 });
  }, [layers, layerVisibility, mapData, onPopupOpen]);

  return {
    layerToggles,
    activeLayers,
  };
}
