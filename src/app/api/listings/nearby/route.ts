import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const CAMEROON_CITIES: { [key: string]: { lat: number; lng: number } } = {
  "Douala": { lat: 4.0511, lng: 9.7679 },
  "Yaoundé": { lat: 3.8480, lng: 11.5021 },
  "Bamenda": { lat: 5.9631, lng: 10.1591 },
  "Bafoussam": { lat: 5.4781, lng: 10.4178 },
  "Garoua": { lat: 9.3012, lng: 13.3964 },
  "Limbe": { lat: 4.0167, lng: 9.2000 },
  "Buea": { lat: 4.1560, lng: 9.2324 },
  "Kribi": { lat: 2.9333, lng: 9.9167 },
};

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lng = parseFloat(searchParams.get("lng") || "0");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  let nearestCity = "Douala";
  let minDistance = Infinity;

  for (const [city, coords] of Object.entries(CAMEROON_CITIES)) {
    const distance = getDistance(lat, lng, coords.lat, coords.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  }

  const { data, error } = await supabaseAdmin
    .from("listings")
    .select("*")
    .eq("status", "approved")
    .ilike("location", `%${nearestCity}%`)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    console.error("Error fetching nearby listings:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }

  if (!data || data.length === 0) {
    const { data: fallback } = await supabaseAdmin
      .from("listings")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(12);

    return NextResponse.json({ 
      listings: fallback || [],
      location: "Cameroon"
    });
  }

  return NextResponse.json({ 
    listings: data,
    location: nearestCity
  });
}
