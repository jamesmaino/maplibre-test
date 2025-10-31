"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
});

interface ClientMapProps {
  pageId?: 'biolinks' | 'weeds' | 'heritage';
}

export default function ClientMap({ pageId = 'biolinks' }: ClientMapProps) {
  return <Map pageId={pageId} />;
}