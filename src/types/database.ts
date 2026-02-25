export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price_per_night: number;
  location: string;
  category: string;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  amenities: string[];
  images: string[];
  status: "pending_review" | "approved" | "rejected";
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  listing_id: string;
  user_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  nights?: number;
  total_price: number;
  status: "pending" | "confirmed" | "cancelled";
  payment_status?: string;
  stripe_payment_intent_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  host_id: string;
  guest_id: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  listing_id: string;
  user_id: string;
  overall_rating: number;
  cleanliness_rating: number;
  communication_rating: number;
  location_rating: number;
  value_rating: number;
  comment?: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
