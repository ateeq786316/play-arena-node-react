"use client";

import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("./NearMeMapImpl"),
  { ssr: false, loading: () => <div className="h-full w-full rounded-xl bg-muted animate-pulse" /> },
);

export default MapContainer;
