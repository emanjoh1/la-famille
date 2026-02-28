"use client";

import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";

export function LocationMap({ location }: { location: string }) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  // Use Maps Embed API with proper key
  const mapUrl = apiKey 
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(location + ', Cameroon')}&zoom=13`
    : `https://maps.google.com/maps?q=${encodeURIComponent(location + ', Cameroon')}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  useEffect(() => {
    setMapLoaded(true);
  }, []);

  return (
    <div className="py-6 border-b border-[#DDDDDD]">
      <h3 className="text-xl font-semibold text-[#222222] mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5" />
        Where you'll be
      </h3>
      <div className="rounded-xl overflow-hidden border border-[#DDDDDD] shadow-sm bg-gray-100 relative" style={{ minHeight: '400px' }}>
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400 animate-pulse" />
              <p className="text-gray-500">Loading map...</p>
            </div>
          </div>
        )}
        <iframe
          width="100%"
          height="400"
          style={{ border: 0, display: mapLoaded ? 'block' : 'none' }}
          loading="eager"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={mapUrl}
          className="w-full"
          title={`Map of ${location}`}
          onLoad={() => setMapLoaded(true)}
        />
      </div>
      <p className="text-[#717171] mt-3">{location}, Cameroon</p>
    </div>
  );
}
