"use client";

import dynamic from "next/dynamic";
import { MapData } from "../../types/data";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
});

export default function ClientMap({ data }: { data: MapData }) {
  return <Map data={data} />;
}
