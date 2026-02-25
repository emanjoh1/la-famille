import { describe, it, expect } from "vitest";
import {
  listingSchema,
  bookingSchema,
  reviewSchema,
  messageSchema,
} from "@/lib/validators";

describe("listingSchema", () => {
  const validListing = {
    title: "Beautiful apartment in Douala",
    description: "A wonderful place to stay with great views and amenities included.",
    category: "apartment",
    address: "123 Rue de la Joie",
    city: "Douala",
    region: "LT",
    price_per_night: 25000,
    max_guests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    amenities: ["wifi", "ac"],
  };

  it("accepts valid listing data", () => {
    const result = listingSchema.safeParse(validListing);
    expect(result.success).toBe(true);
  });

  it("rejects title shorter than 5 chars", () => {
    const result = listingSchema.safeParse({ ...validListing, title: "Hi" });
    expect(result.success).toBe(false);
  });

  it("rejects title longer than 120 chars", () => {
    const result = listingSchema.safeParse({
      ...validListing,
      title: "A".repeat(121),
    });
    expect(result.success).toBe(false);
  });

  it("rejects description shorter than 20 chars", () => {
    const result = listingSchema.safeParse({
      ...validListing,
      description: "Too short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects price below 1000 FCFA", () => {
    const result = listingSchema.safeParse({
      ...validListing,
      price_per_night: 500,
    });
    expect(result.success).toBe(false);
  });

  it("rejects price above 10,000,000 FCFA", () => {
    const result = listingSchema.safeParse({
      ...validListing,
      price_per_night: 10_000_001,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid category", () => {
    const result = listingSchema.safeParse({
      ...validListing,
      category: "castle",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid region code", () => {
    const result = listingSchema.safeParse({
      ...validListing,
      region: "XX",
    });
    expect(result.success).toBe(false);
  });

  it("defaults amenities to empty array", () => {
    const { amenities, ...rest } = validListing;
    const result = listingSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amenities).toEqual([]);
    }
  });

  it("rejects 0 max_guests", () => {
    const result = listingSchema.safeParse({
      ...validListing,
      max_guests: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer price", () => {
    const result = listingSchema.safeParse({
      ...validListing,
      price_per_night: 25000.5,
    });
    expect(result.success).toBe(false);
  });
});

describe("bookingSchema", () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 1);
  const checkOutDate = new Date();
  checkOutDate.setDate(checkOutDate.getDate() + 3);

  const validBooking = {
    listing_id: "123e4567-e89b-12d3-a456-426614174000",
    check_in: futureDate.toISOString(),
    check_out: checkOutDate.toISOString(),
    num_guests: 2,
  };

  it("accepts valid booking data", () => {
    const result = bookingSchema.safeParse(validBooking);
    expect(result.success).toBe(true);
  });

  it("rejects invalid listing_id (not UUID)", () => {
    const result = bookingSchema.safeParse({
      ...validBooking,
      listing_id: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects check_out before check_in", () => {
    const result = bookingSchema.safeParse({
      ...validBooking,
      check_out: futureDate.toISOString(), // same as check_in
    });
    expect(result.success).toBe(false);
  });

  it("rejects 0 guests", () => {
    const result = bookingSchema.safeParse({
      ...validBooking,
      num_guests: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects more than 50 guests", () => {
    const result = bookingSchema.safeParse({
      ...validBooking,
      num_guests: 51,
    });
    expect(result.success).toBe(false);
  });
});

describe("reviewSchema", () => {
  const validReview = {
    booking_id: "123e4567-e89b-12d3-a456-426614174000",
    overall_rating: 5,
    cleanliness_rating: 4,
    communication_rating: 5,
    location_rating: 3,
    value_rating: 4,
  };

  it("accepts valid review without comment", () => {
    const result = reviewSchema.safeParse(validReview);
    expect(result.success).toBe(true);
  });

  it("accepts valid review with comment", () => {
    const result = reviewSchema.safeParse({
      ...validReview,
      comment: "Great place to stay, very clean and well located!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects rating below 1", () => {
    const result = reviewSchema.safeParse({
      ...validReview,
      overall_rating: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects rating above 5", () => {
    const result = reviewSchema.safeParse({
      ...validReview,
      cleanliness_rating: 6,
    });
    expect(result.success).toBe(false);
  });

  it("rejects comment shorter than 10 chars", () => {
    const result = reviewSchema.safeParse({
      ...validReview,
      comment: "Bad",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid booking_id", () => {
    const result = reviewSchema.safeParse({
      ...validReview,
      booking_id: "invalid",
    });
    expect(result.success).toBe(false);
  });
});

describe("messageSchema", () => {
  it("accepts valid message", () => {
    const result = messageSchema.safeParse({
      conversation_id: "123e4567-e89b-12d3-a456-426614174000",
      content: "Hello, is this place available?",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty content", () => {
    const result = messageSchema.safeParse({
      conversation_id: "123e4567-e89b-12d3-a456-426614174000",
      content: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects content over 5000 chars", () => {
    const result = messageSchema.safeParse({
      conversation_id: "123e4567-e89b-12d3-a456-426614174000",
      content: "A".repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid conversation_id", () => {
    const result = messageSchema.safeParse({
      conversation_id: "not-a-uuid",
      content: "Hello",
    });
    expect(result.success).toBe(false);
  });
});
