"use client";

import { useSession } from "next-auth/react";
import ClientMap from "../components/map/ClientMap";

export default function Home() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="min-h-screen flex flex-col">
        <main>
          <ClientMap pageId="biolinks" />
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