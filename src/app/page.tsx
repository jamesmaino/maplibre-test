"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import ClientMap from "./components/ClientMap";
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
        <footer className="absolute left-1 bottom-1 text-slate-300 px-2 py-1 flex-col justify-between items-center">
          <button
            onClick={() => signOut()}
            className="bg-slate-700 hover:bg-slate-500 text-slate-200  py-1 px-2 rounded"
          >
            Sign out
          </button>
          <div className="text-sm text-slate-900 py-1 px-2">
            {session.user?.name} ({session.user?.group})
          </div>
        </footer>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="p-8 solid rounded shadow-md flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Not signed in</h1>
        <button
          onClick={() => signIn()}
          className="bg-slate-500 hover:bg-slate-700 shadow-md text-white font-bold py-2 px-4 rounded hover:cursor-pointer"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
