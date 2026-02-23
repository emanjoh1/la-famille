// ---------------------------------------------------------------------------
// Cameroon Regions (all 10)
// ---------------------------------------------------------------------------
export const CAMEROON_REGIONS = [
  { code: 'AD', name_fr: 'Adamaoua', name_en: 'Adamawa' },
  { code: 'CE', name_fr: 'Centre', name_en: 'Centre' },
  { code: 'EN', name_fr: 'Extrême-Nord', name_en: 'Far North' },
  { code: 'ES', name_fr: 'Est', name_en: 'East' },
  { code: 'LT', name_fr: 'Littoral', name_en: 'Littoral' },
  { code: 'NO', name_fr: 'Nord', name_en: 'North' },
  { code: 'NW', name_fr: 'Nord-Ouest', name_en: 'Northwest' },
  { code: 'OU', name_fr: 'Ouest', name_en: 'West' },
  { code: 'SU', name_fr: 'Sud', name_en: 'South' },
  { code: 'SW', name_fr: 'Sud-Ouest', name_en: 'Southwest' },
] as const

export type CameroonRegionCode = (typeof CAMEROON_REGIONS)[number]['code']

// ---------------------------------------------------------------------------
// Popular Cities
// ---------------------------------------------------------------------------
export const POPULAR_CITIES = [
  { name: 'Douala', region: 'LT', lat: 4.0511, lng: 9.7679 },
  { name: 'Yaound\u00e9', region: 'CE', lat: 3.848, lng: 11.5021 },
  { name: 'Bamenda', region: 'NW', lat: 5.9631, lng: 10.1591 },
  { name: 'Buea', region: 'SW', lat: 4.1527, lng: 9.241 },
  { name: 'Limbe', region: 'SW', lat: 4.0186, lng: 9.2043 },
  { name: 'Kribi', region: 'SU', lat: 2.9404, lng: 9.9104 },
  { name: 'Bafoussam', region: 'OU', lat: 5.4764, lng: 10.4177 },
  { name: 'Garoua', region: 'NO', lat: 9.3023, lng: 13.3975 },
  { name: 'Maroua', region: 'EN', lat: 10.5953, lng: 14.3157 },
  { name: 'Bertoua', region: 'ES', lat: 4.5773, lng: 13.684 },
  { name: 'Ngaound\u00e9r\u00e9', region: 'AD', lat: 7.3167, lng: 13.5833 },
  { name: 'Ebolowa', region: 'SU', lat: 2.9, lng: 11.15 },
] as const

// ---------------------------------------------------------------------------
// Listing Categories
// ---------------------------------------------------------------------------
export const LISTING_CATEGORIES = [
  {
    value: 'apartment',
    label_fr: 'Appartement',
    label_en: 'Apartment',
    icon: 'Building2',
  },
  {
    value: 'house',
    label_fr: 'Maison',
    label_en: 'House',
    icon: 'Home',
  },
  {
    value: 'villa',
    label_fr: 'Villa',
    label_en: 'Villa',
    icon: 'Castle',
  },
  {
    value: 'room',
    label_fr: 'Chambre',
    label_en: 'Room',
    icon: 'DoorOpen',
  },
  {
    value: 'studio',
    label_fr: 'Studio',
    label_en: 'Studio',
    icon: 'LayoutGrid',
  },
  {
    value: 'guesthouse',
    label_fr: "Maison d'h\u00f4tes",
    label_en: 'Guesthouse',
    icon: 'Hotel',
  },
] as const

export type ListingCategory = (typeof LISTING_CATEGORIES)[number]['value']

// ---------------------------------------------------------------------------
// Amenities (standard + Cameroon-specific)
// ---------------------------------------------------------------------------
export const AMENITIES = [
  // Standard amenities
  { key: 'wifi', label_en: 'Wi-Fi', label_fr: 'Wi-Fi', icon: 'Wifi' },
  {
    key: 'ac',
    label_en: 'Air Conditioning',
    label_fr: 'Climatisation',
    icon: 'AirVent',
  },
  {
    key: 'parking',
    label_en: 'Parking',
    label_fr: 'Parking',
    icon: 'Car',
  },
  { key: 'pool', label_en: 'Pool', label_fr: 'Piscine', icon: 'Waves' },
  {
    key: 'kitchen',
    label_en: 'Kitchen',
    label_fr: 'Cuisine',
    icon: 'CookingPot',
  },
  {
    key: 'washer',
    label_en: 'Washer',
    label_fr: 'Machine \u00e0 laver',
    icon: 'WashingMachine',
  },
  { key: 'tv', label_en: 'TV', label_fr: 'T\u00e9l\u00e9vision', icon: 'Tv' },

  // Cameroon-specific amenities
  {
    key: 'generator',
    label_en: 'Generator',
    label_fr: 'G\u00e9n\u00e9rateur',
    icon: 'Zap',
  },
  {
    key: 'water_tank',
    label_en: 'Water Tank',
    label_fr: "R\u00e9servoir d'eau",
    icon: 'Droplets',
  },
  {
    key: 'security_guard',
    label_en: 'Security Guard',
    label_fr: 'Gardien',
    icon: 'ShieldCheck',
  },
  {
    key: 'gated',
    label_en: 'Gated Compound',
    label_fr: 'R\u00e9sidence cl\u00f4tur\u00e9e',
    icon: 'Fence',
  },
  {
    key: 'hot_water',
    label_en: 'Hot Water',
    label_fr: 'Eau chaude',
    icon: 'Flame',
  },
] as const

export type AmenityKey = (typeof AMENITIES)[number]['key']

// ---------------------------------------------------------------------------
// Currency
// ---------------------------------------------------------------------------
export const CURRENCY = {
  code: 'XAF',
  symbol: 'FCFA',
  locale: 'fr-CM',
  isZeroDecimal: true,
} as const

// ---------------------------------------------------------------------------
// Booking Statuses
// ---------------------------------------------------------------------------
export const BOOKING_STATUSES = [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'rejected',
] as const

export type BookingStatus = (typeof BOOKING_STATUSES)[number]

// ---------------------------------------------------------------------------
// Listing Statuses
// ---------------------------------------------------------------------------
export const LISTING_STATUSES = [
  'draft',
  'published',
  'archived',
  'under_review',
] as const

export type ListingStatus = (typeof LISTING_STATUSES)[number]
