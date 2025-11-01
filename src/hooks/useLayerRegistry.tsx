
import { useState, useMemo, useEffect } from "react";
import {
  getLayersForPage,
  PopupInfo,
} from "../app/components/map/config/layerRegistry";
import { MapData } from "@/types/data";

export function useLayerRegistry(
  onPopupOpen: (info: PopupInfo) => void,
  pageId: "biolinks" | "weeds" | "heritage" = "biolinks"
) {
  const layers = useMemo(() => getLayersForPage(pageId), [pageId]);

  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>(
    () =>
      layers.reduce(
        (acc, pageLayer) => ({
          ...acc,
          [pageLayer.layer.id]: pageLayer.defaultVisible,
        }),
        {}
      )
  );

  const [mapData, setMapData] = useState<MapData>({});

  useEffect(() => {
    const layerIds = layers
      .filter((pageLayer) => pageLayer.layer.dataSource)
      .map((pageLayer) => pageLayer.layer.id);

    if (layerIds.length === 0) {
      setMapData({});
      return;
    }

    const query = layerIds.map((id) => `layers=${id}`).join("&");

    fetch(`/api/data?${query}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        setMapData(data.data || {});
      })
      .catch((error) => {
        console.error("Failed to fetch layer data:", error);
        setMapData({});
      });
  }, [layers]);

  const layerToggles = useMemo(
    () =>
      layers.map((pageLayer) => ({
        id: pageLayer.layer.id,
        name: pageLayer.layer.name,
        isVisible: layerVisibility[pageLayer.layer.id] ?? pageLayer.defaultVisible,
        toggle: () =>
          setLayerVisibility((prev) => ({
            ...prev,
            [pageLayer.layer.id]: !prev[pageLayer.layer.id],
          })),
      })),
    [layers, layerVisibility]
  );

  const activeLayers = useMemo(() => {
    return layers
      .filter((pageLayer) => layerVisibility[pageLayer.layer.id])
      .filter((pageLayer) => {
        if (!pageLayer.layer.dataSource) return true;

        const layerData = mapData[pageLayer.layer.id];
        if (!layerData) return false;

        if (pageLayer.layer.shouldShow && !pageLayer.layer.shouldShow(layerData)) return false;

        return true;
      })
      .map((pageLayer) => {
        const layerData = mapData[pageLayer.layer.id];
        return {
          id: pageLayer.layer.id,
          Component: pageLayer.layer.Component,
          props: {
            data: layerData,
            onPopupOpen,
            layerId: pageLayer.layer.id,
          },
        };
      });
  }, [layers, layerVisibility, mapData, onPopupOpen]);

  return {
    layerToggles,
    activeLayers,
  };
}
