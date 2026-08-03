"use client";

import { MapContainer as LeafletMap, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { NearbyGround } from "@playarena/shared/types";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

interface NearMeMapImplProps {
  grounds: NearbyGround[];
  center: { latitude: number; longitude: number };
}

const DEFAULT_ICON = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function NearMeMapImpl({ grounds, center }: NearMeMapImplProps) {
  return (
    <LeafletMap
      center={[center.latitude, center.longitude]}
      zoom={13}
      scrollWheelZoom={false}
      className="h-full w-full rounded-xl z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {grounds.map((g) => (
        <Marker key={g.id} position={[Number(g.latitude), Number(g.longitude)]} icon={DEFAULT_ICON}>
          <Popup>
            <Link href={`/grounds/${g.id}`} className="text-sm font-medium">
              {g.name}
            </Link>
            <p className="text-xs text-muted-foreground">{g.address}</p>
            {g.distance_km != null && <p className="text-xs text-primary mt-1">{g.distance_km} km away</p>}
          </Popup>
        </Marker>
      ))}
    </LeafletMap>
  );
}
