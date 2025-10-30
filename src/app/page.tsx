"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import ClientMap from "./components/map/ClientMap";
import { MapData } from "../types/data";

export default function Home() {
  const { data: session } = useSession();
  const [data, setData] = useState<MapData | null>(null);

  useEffect(() => {
    if (session) {
      const fetchData = async () => {
        const res = await fetch("/api/data");
        const data = await res.json();
        setData(data);
      };
      fetchData();
    }
  }, [session]);

  if (session) {
    return (
      <div className="min-h-screen flex flex-col">
        <main>
          {data ? (
            <ClientMap data={data} />
          ) : (
            <div className="flex justify-center items-center h-full">
              Loading...
            </div>
          )}
        </main>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="p-8 solid rounded shadow-md flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Not signed in</h1>
        <p className="text-slate-600">Please sign in using the sidebar</p>
      </div>
    </div>
  );
}
