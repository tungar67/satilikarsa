import { useEffect, useRef } from "react";

export type MapPin = { lat: number; lng: number; label: string };

type Props = { pins: MapPin[]; zoom: number };

export function ParcelMap({ pins, zoom }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const key = pins.map((p) => `${p.lat},${p.lng},${p.label}`).join("|");

  useEffect(() => {
    const el = ref.current;
    if (!el || pins.length === 0) return;
    let map: { remove: () => void } | undefined;
    let cancelled = false;

    void import("leaflet").then((L) => {
      if (cancelled || !ref.current) return;
      const m = L.map(ref.current, { scrollWheelZoom: false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(m);
      const marks = pins.map((pin) =>
        L.circleMarker([pin.lat, pin.lng], {
          radius: pins.length > 1 ? 7 : 9,
          color: "#2a3323",
          weight: 2,
          fillColor: "#a07c3e",
          fillOpacity: 1,
        })
          .addTo(m)
          .bindPopup(pin.label),
      );
      if (marks.length === 1) m.setView([pins[0].lat, pins[0].lng], zoom);
      else m.fitBounds(L.latLngBounds(pins.map((p) => [p.lat, p.lng])), { padding: [28, 28] });
      map = m;
      window.setTimeout(() => m.invalidateSize(), 180);
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [key, zoom]);

  return <div ref={ref} className="h-96 w-full overflow-hidden rounded-card bg-line" />;
}
