"use client";

import { useEffect } from "react";
import { RMap } from "maplibre-react-components";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";

export default function ClientMap() {
  useEffect(() => {
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  return (
    <div className="App" style={{ width: "100%", height: "100%" }}>
      <RMap
        initialCenter={[0, 0]}
        initialZoom={1}
        mapStyle={{
          version: 8,
          sources: {
            sample: {
              type: "vector",
              url: "pmtiles://https://r2-public.protomaps.com/protomaps-sample-datasets/cb_2018_us_zcta510_500k.pmtiles",
            },
          },
          layers: [
            {
              id: "zcta",
              source: "sample",
              "source-layer": "zcta",
              type: "line",
              paint: {
                "line-color": "#999",
              },
            },
          ],
        }}
      />
    </div>
  );
}
