"use client";

import { useEffect, useState } from "react";
import { ListingCard } from "./ListingCard";
import { MapPin, Loader2, X } from "lucide-react";

interface Listing {
  id: string;
  location: string;
  title: string;
  bedrooms: number;
  bathrooms: number;
  price_per_night: number;
  images: string[];
}

export function LocationBasedListings({ fallbackListings }: { fallbackListings: Listing[] }) {
  const [listings, setListings] = useState<Listing[]>(fallbackListings);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [permissionAsked, setPermissionAsked] = useState(false);

  useEffect(() => {
    const asked = localStorage.getItem("locationPermissionAsked");
    if (!asked && "geolocation" in navigator) {
      setShowPermissionDialog(true);
    }
  }, []);

  const handleAllowLocation = () => {
    setShowPermissionDialog(false);
    setPermissionAsked(true);
    setLoading(true);
    localStorage.setItem("locationPermissionAsked", "true");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `/api/listings/nearby?lat=${latitude}&lng=${longitude}`
          );
          const data = await response.json();
          
          if (data.listings && data.listings.length > 0) {
            setListings(data.listings);
            setUserLocation(data.location || "your area");
          }
        } catch (error) {
          console.error("Failed to fetch nearby listings:", error);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
      }
    );
  };

  const handleDenyLocation = () => {
    setShowPermissionDialog(false);
    setPermissionAsked(true);
    localStorage.setItem("locationPermissionAsked", "true");
  };

  return (
    <div>
      {/* Permission Dialog */}
      {showPermissionDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={handleDenyLocation}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-orange-100 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-[#1E3A8A]" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Find Stays Near You
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Allow La Famille to access your location to show you properties nearby and personalize your experience.
              </p>
              
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={handleAllowLocation}
                  className="w-full py-3 bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] text-white rounded-xl font-semibold
                             hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Allow Location Access
                </button>
                
                <button
                  onClick={handleDenyLocation}
                  className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold
                             hover:bg-gray-50 transition-colors"
                >
                  Not Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-orange-50 rounded-full mb-4">
          {loading ? (
            <Loader2 className="w-4 h-4 text-[#1E3A8A] animate-spin" />
          ) : (
            <MapPin className="w-4 h-4 text-[#1E3A8A]" />
          )}
          <span className="text-sm font-semibold text-gray-900">
            {loading ? "Finding stays near you..." : userLocation ? `Near ${userLocation}` : "Suggested for you"}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {userLocation ? `Stays Near You` : "Discover Amazing Stays"}
        </h1>
        <p className="text-gray-600">
          {userLocation ? `Properties in ${userLocation}` : "Handpicked properties across Cameroon"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            id={listing.id}
            location={listing.location}
            title={listing.title}
            bedrooms={listing.bedrooms}
            bathrooms={listing.bathrooms}
            price_per_night={listing.price_per_night}
            images={listing.images}
          />
        ))}
      </div>
    </div>
  );
}
