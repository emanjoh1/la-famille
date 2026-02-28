# Bilingual Implementation Guide

## Current Status
✅ Translation system is fully set up
✅ French and English dictionaries exist
✅ Language switcher works in navbar
✅ Navbar is already translated

## What Needs to Be Done
Most pages use hardcoded English text instead of the translation function. Each page needs to be updated to use `useDict()` hook.

## How to Translate a Component

### Step 1: Import the hook
```tsx
import { useDict } from "@/lib/i18n/use-dict";
```

### Step 2: Use the hook in your component
```tsx
export function MyComponent() {
  const { t, locale } = useDict();
  
  return (
    <div>
      <h1>{t("hero.title")}</h1>
      <p>{t("hero.subtitle")}</p>
    </div>
  );
}
```

### Step 3: For constants (categories, amenities)
```tsx
import { getCategoryLabel, getAmenityLabel } from "@/lib/utils/labels";

const label = getCategoryLabel(category.value, locale);
const amenityLabel = getAmenityLabel(amenity.key, locale);
```

## Pages That Need Translation

### Priority 1 - User-Facing Pages
- [ ] `/src/app/page.tsx` - Homepage
- [ ] `/src/app/(platform)/explore/page.tsx` - Explore page
- [ ] `/src/app/(platform)/listings/[id]/page.tsx` - Listing detail
- [ ] `/src/components/booking/BookingWidget.tsx` - Booking widget
- [ ] `/src/app/(platform)/bookings/page.tsx` - My bookings
- [ ] `/src/app/(platform)/favorites/page.tsx` - Favorites
- [ ] `/src/app/(platform)/messages/page.tsx` - Messages

### Priority 2 - Host Pages
- [ ] `/src/app/(platform)/host/listings/new/page.tsx` - Create listing
- [ ] `/src/app/(platform)/host/listings/[id]/edit/page.tsx` - Edit listing
- [ ] `/src/app/(platform)/host/listings/page.tsx` - My listings

### Priority 3 - Components
- [ ] `/src/components/listings/ListingCard.tsx`
- [ ] `/src/components/listings/CategoryBar.tsx` (partially done)
- [ ] `/src/components/reviews/ReviewList.tsx`
- [ ] `/src/components/home/SearchBar.tsx`

## Translation Keys Available

Check `/src/lib/i18n/dictionaries/en.json` and `fr.json` for all available keys.

Common keys:
- `common.*` - Common words (save, cancel, edit, etc.)
- `nav.*` - Navigation items
- `hero.*` - Homepage hero section
- `search.*` - Search related
- `listing.*` - Listing details
- `booking.*` - Booking related
- `host.*` - Host dashboard
- `messages.*` - Messaging
- `favorites.*` - Favorites/wishlists

## Example: Translating the Homepage

Before:
```tsx
<h1>Your Home Away From Home</h1>
<p>Discover unique stays across Cameroon</p>
<button>Get Started</button>
```

After:
```tsx
import { useDict } from "@/lib/i18n/use-dict";

export default function HomePage() {
  const { t } = useDict();
  
  return (
    <>
      <h1>{t("hero.title")}</h1>
      <p>{t("hero.subtitle")}</p>
      <button>{t("common.sign_up")}</button>
    </>
  );
}
```

## Testing Translations

1. Click the Globe icon in navbar to switch language
2. Or use browser console:
   ```javascript
   localStorage.setItem('la-famille-locale', 'fr')
   location.reload()
   ```

## Adding New Translation Keys

1. Add to both `/src/lib/i18n/dictionaries/en.json` and `fr.json`
2. Keep the structure identical in both files
3. Use dot notation for nested keys

Example:
```json
{
  "booking": {
    "new_key": "English text"
  }
}
```

## Quick Win: Update One Page Now

To see it working immediately, let's update the homepage. The file is at:
`/src/app/page.tsx`

Replace hardcoded text with:
- "Your Home Away From Home" → `{t("hero.title")}`
- "Discover unique stays" → `{t("hero.subtitle")}`
- "Get Started" → `{t("common.sign_up")}`
- "Explore" → `{t("nav.explore")}`

## Need Help?

The translation system is working. The navbar already switches languages. Each page just needs to be updated to use `t()` instead of hardcoded text.

This is a systematic task that requires going through each file and replacing English text with translation keys.
