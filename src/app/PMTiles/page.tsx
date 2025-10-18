"use client";

import dynamic from "next/dynamic";

const ClientMap = dynamic(() => import("./ClientMap"), {
  ssr: false,
});

export default function Page() {
  return <ClientMap />;
}