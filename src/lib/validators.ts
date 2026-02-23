import { z } from 'zod'
import { LISTING_CATEGORIES, AMENITIES, CAMEROON_REGIONS } from '@/lib/utils/constants'

// ---------------------------------------------------------------------------
// Derived value arrays for enums
// ---------------------------------------------------------------------------
const categoryValues = LISTING_CATEGORIES.map((c) => c.value) as [
  string,
  ...string[],
]

const regionCodes = CAMEROON_REGIONS.map((r) => r.code) as [
  string,
  ...string[],
]

const amenityKeys = AMENITIES.map((a) => a.key) as [string, ...string[]]

// ---------------------------------------------------------------------------
// Listing Schema
// ---------------------------------------------------------------------------
export const listingSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(120, 'Title must be at most 120 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description must be at most 5000 characters'),
  category: z.enum(categoryValues),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(255, 'Address must be at most 255 characters'),
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must be at most 100 characters'),
  region: z.enum(regionCodes),
  price_per_night: z
    .number()
    .int('Price must be a whole number (XAF has no decimals)')
    .min(1000, 'Minimum price is 1,000 FCFA')
    .max(10_000_000, 'Maximum price is 10,000,000 FCFA'),
  cleaning_fee: z
    .number()
    .int('Cleaning fee must be a whole number')
    .min(0, 'Cleaning fee cannot be negative')
    .max(1_000_000, 'Maximum cleaning fee is 1,000,000 FCFA')
    .optional()
    .default(0),
  max_guests: z
    .number()
    .int()
    .min(1, 'Must accommodate at least 1 guest')
    .max(50, 'Maximum 50 guests'),
  bedrooms: z
    .number()
    .int()
    .min(0, 'Bedrooms cannot be negative')
    .max(30, 'Maximum 30 bedrooms'),
  beds: z
    .number()
    .int()
    .min(1, 'Must have at least 1 bed')
    .max(50, 'Maximum 50 beds'),
  bathrooms: z
    .number()
    .int()
    .min(0, 'Bathrooms cannot be negative')
    .max(30, 'Maximum 30 bathrooms'),
  amenities: z.array(z.enum(amenityKeys)).default([]),
})

export type ListingInput = z.infer<typeof listingSchema>

// ---------------------------------------------------------------------------
// Booking Schema
// ---------------------------------------------------------------------------
export const bookingSchema = z
  .object({
    listing_id: z.string().uuid('Invalid listing ID'),
    check_in: z.coerce
      .date()
      .refine((d) => d >= new Date(new Date().toDateString()), {
        message: 'Check-in date must be today or in the future',
      }),
    check_out: z.coerce.date(),
    num_guests: z
      .number()
      .int()
      .min(1, 'Must have at least 1 guest')
      .max(50, 'Maximum 50 guests'),
  })
  .refine((data) => data.check_out > data.check_in, {
    message: 'Check-out must be after check-in',
    path: ['check_out'],
  })

export type BookingInput = z.infer<typeof bookingSchema>

// ---------------------------------------------------------------------------
// Review Schema
// ---------------------------------------------------------------------------
export const reviewSchema = z.object({
  booking_id: z.string().uuid('Invalid booking ID'),
  overall_rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  cleanliness_rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  communication_rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  location_rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  value_rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  comment: z
    .string()
    .min(10, 'Comment must be at least 10 characters')
    .max(2000, 'Comment must be at most 2000 characters')
    .optional(),
})

export type ReviewInput = z.infer<typeof reviewSchema>

// ---------------------------------------------------------------------------
// Message Schema
// ---------------------------------------------------------------------------
export const messageSchema = z.object({
  conversation_id: z.string().uuid('Invalid conversation ID'),
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message must be at most 5000 characters'),
})

export type MessageInput = z.infer<typeof messageSchema>
