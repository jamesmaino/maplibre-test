"use client";
import { useMap } from "maplibre-react-components";
import { useEffect, useState, memo } from "react";
import MaplibreDraw from "maplibre-gl-draw";
import "maplibre-gl-draw/dist/mapbox-gl-draw.css";
import { Feature } from "geojson";

interface RDrawProps {
  onCreate: (features: Feature[]) => void;
  onUpdate: (features: Feature[]) => void;
  onDelete: (features: Feature[]) => void;
}

function RDraw(props: RDrawProps) {
  const map = useMap();
  const [draw] = useState(
    () =>
      new MaplibreDraw({
        displayControlsDefault: false,
        controls: {
          point: true,
          polygon: true,
          line_string: true,
          trash: true,
        },
        styles: [
          // ACTIVE (being drawn)
          {
            id: "gl-draw-line",
            type: "line",
            filter: [
              "all",
              ["==", "$type", "LineString"],
              ["!=", "mode", "static"],
            ],
            layout: {
              "line-cap": "round",
              "line-join": "round",
            },
            paint: {
              "line-color": "#D20C0C",
              "line-dasharray": [0.2, 2],
              "line-width": 2,
            },
          },
          {
            id: "gl-draw-polygon-fill",
            type: "fill",
            filter: [
              "all",
              ["==", "$type", "Polygon"],
              ["!=", "mode", "static"],
            ],
            paint: {
              "fill-color": "#D20C0C",
              "fill-outline-color": "#D20C0C",
              "fill-opacity": 0.1,
            },
          },
          {
            id: "gl-draw-polygon-stroke-active",
            type: "line",
            filter: [
              "all",
              ["==", "$type", "Polygon"],
              ["!=", "mode", "static"],
            ],
            layout: {
              "line-cap": "round",
              "line-join": "round",
            },
            paint: {
              "line-color": "#D20C0C",
              "line-dasharray": [0.2, 2],
              "line-width": 2,
            },
          },
          {
            id: "gl-draw-polygon-and-line-vertex-stroke-inactive",
            type: "circle",
            filter: [
              "all",
              ["==", "meta", "vertex"],
              ["==", "$type", "Point"],
              ["!=", "mode", "static"],
            ],
            paint: {
              "circle-radius": 5,
              "circle-color": "#FFF",
            },
          },
          {
            id: "gl-draw-polygon-and-line-vertex-inactive",
            type: "circle",
            filter: [
              "all",
              ["==", "meta", "vertex"],
              ["==", "$type", "Point"],
              ["!=", "mode", "static"],
            ],
            paint: {
              "circle-radius": 3,
              "circle-color": "#D20C0C",
            },
          },
          {
            id: "gl-draw-point",
            type: "circle",
            filter: ["all", ["==", "$type", "Point"], ["!=", "mode", "static"]],
            paint: {
              "circle-radius": 5,
              "circle-color": "#D20C0C",
            },
          },

          // INACTIVE (static)
          {
            id: "gl-draw-line-static",
            type: "line",
            filter: [
              "all",
              ["==", "$type", "LineString"],
              ["==", "mode", "static"],
            ],
            layout: {
              "line-cap": "round",
              "line-join": "round",
            },
            paint: {
              "line-color": "#000",
              "line-width": 3,
            },
          },
          {
            id: "gl-draw-polygon-fill-static",
            type: "fill",
            filter: [
              "all",
              ["==", "$type", "Polygon"],
              ["==", "mode", "static"],
            ],
            paint: {
              "fill-color": "#000",
              "fill-outline-color": "#000",
              "fill-opacity": 0.1,
            },
          },
          {
            id: "gl-draw-polygon-stroke-static",
            type: "line",
            filter: [
              "all",
              ["==", "$type", "Polygon"],
              ["==", "mode", "static"],
            ],
            layout: {
              "line-cap": "round",
              "line-join": "round",
            },
            paint: {
              "line-color": "#000",
              "line-width": 3,
            },
          },
        ],
      })
  );

  useEffect(() => {
    map.addControl(draw as any);

    const mapCanvas = map.getCanvas();

    const onModeChange = (e: any) => {
      if (
        e.mode === "draw_polygon" ||
        e.mode === "draw_line_string" ||
        e.mode === "draw_point"
      ) {
        mapCanvas.style.cursor = "crosshair";
      } else {
        mapCanvas.style.cursor = "";
      }
    };

    map.on("draw.modechange", onModeChange);
    map.on("draw.create", (e: any) => {
      props.onCreate(e.features);
    });
    map.on("draw.update", (e: any) => {
      props.onUpdate(e.features);
    });
    map.on("draw.delete", (e: any) => {
      props.onDelete(e.features);
    });
    return () => {
      map.off("draw.modechange", onModeChange);
      mapCanvas.style.cursor = "";
      map.removeControl(draw);
    };
  }, []);

  return null;
}

export default memo(RDraw);
