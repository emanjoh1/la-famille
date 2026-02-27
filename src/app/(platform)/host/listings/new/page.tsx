"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createListing } from "@/actions/listings";
import { useUploadThing } from "@/lib/uploadthing";
import { LISTING_CATEGORIES, AMENITIES } from "@/lib/utils/constants";
import {
  Upload,
  Home,
  MapPin,
  Users,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  X,
} from "lucide-react";

const STEPS = [
  { id: 1, title: "About your place", icon: Home },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "Details", icon: Users },
  { id: 4, title: "Amenities", icon: Sparkles },
  { id: 5, title: "Photos", icon: Upload },
  { id: 6, title: "Pricing", icon: DollarSign },
];

type FormField =
  | "title"
  | "description"
  | "location"
  | "category"
  | "bedrooms"
  | "bathrooms"
  | "max_guests"
  | "price_per_night";

export default function NewListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { startUpload } = useUploadThing("listingImages");

  const [formValues, setFormValues] = useState<Record<FormField, string>>({
    title: "",
    description: "",
    location: "",
    category: "apartment",
    bedrooms: "1",
    bathrooms: "1",
    max_guests: "1",
    price_per_night: "",
  });

  const update = (k: FormField, v: string) =>
    setFormValues((prev) => ({ ...prev, [k]: v }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    console.log("Files selected:", files.length);
    setUploading(true);
    setError(null);
    
    try {
      console.log("Starting upload...");
      const uploaded = await startUpload(Array.from(files));
      console.log("Upload result:", uploaded);
      
      if (uploaded) {
        const newUrls = uploaded.map((f) => f.url);
        setImages((prev) => [...prev, ...newUrls]);
        console.log("Images added:", newUrls);
      }
      
      // Reset input to allow re-selection
      e.target.value = '';
    } catch (err) {
      console.error("Upload error:", err);
      setError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError(null);
    
    // Validation
    if (!formValues.title.trim()) {
      setError("Please enter a property title");
      setStep(1);
      return;
    }
    if (formValues.description.length < 20) {
      setError("Description must be at least 20 characters");
      setStep(1);
      return;
    }
    if (!formValues.location.trim()) {
      setError("Please enter a location");
      setStep(2);
      return;
    }
    if (images.length === 0) {
      setError("Please upload at least one photo");
      setStep(5);
      return;
    }
    if (!formValues.price_per_night || Number(formValues.price_per_night) < 1000) {
      setError("Price must be at least 1,000 FCFA");
      setStep(6);
      return;
    }
    
    setSubmitting(true);
    console.log("Submitting listing...");
    
    try {
      const formData = new FormData();
      Object.entries(formValues).forEach(([k, v]) => formData.append(k, v));
      formData.append("images", JSON.stringify(images));
      formData.append("amenities", JSON.stringify(selectedAmenities));
      
      console.log("FormData prepared");
      const result = await createListing(formData);
      console.log("Create listing result:", result);
      
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setSubmitted(true);
    } catch (err) {
      console.error("Submit error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAmenity = (key: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formValues.title.trim() && formValues.description.trim();
      case 2:
        return formValues.location.trim();
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        return images.length > 0;
      case 6:
        return formValues.price_per_night && Number(formValues.price_per_night) >= 1000;
      default:
        return true;
    }
  };

  const getValidationMessage = () => {
    switch (step) {
      case 1:
        if (!formValues.title.trim()) return "Please enter a property title";
        if (!formValues.description.trim()) return "Please enter a description";
        return null;
      case 2:
        if (!formValues.location.trim()) return "Please enter a location";
        return null;
      case 5:
        if (images.length === 0) return "Please upload at least one photo";
        return null;
      case 6:
        if (!formValues.price_per_night) return "Please enter a price";
        if (Number(formValues.price_per_night) < 1000) return "Price must be at least 1,000 FCFA";
        return null;
      default:
        return null;
    }
  };

  const handleNext = () => {
    const validationMsg = getValidationMessage();
    if (validationMsg) {
      setError(validationMsg);
      return;
    }
    setStep((s) => Math.min(STEPS.length, s + 1));
    setError(null);
  };

  const counterFields: { key: FormField; label: string; min: number }[] = [
    { key: "bedrooms", label: "Bedrooms", min: 1 },
    { key: "bathrooms", label: "Bathrooms", min: 1 },
    { key: "max_guests", label: "Max guests", min: 1 },
  ];

  // ── Success screen ──────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-green-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent mb-3">
            Submitted for review!
          </h1>
          <p className="text-gray-700 mb-8 leading-relaxed">
            Your property has been submitted and is under review. We&apos;ll
            approve it within 24–48 hours and notify you once it&apos;s live.
          </p>
          <button
            onClick={() => router.push("/host/listings")}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold
                       hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg"
          >
            Back to my listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-green-50 pb-24">
      {/* Sticky top progress bar */}
      <div className="sticky top-20 bg-white/95 backdrop-blur-sm border-b border-amber-200 z-40 shadow-sm">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                               transition-all duration-300
                               ${
                                 step > s.id
                                   ? "bg-gradient-to-br from-green-600 to-green-700 text-white shadow-md"
                                   : step === s.id
                                     ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md"
                                     : "border-2 border-amber-300 text-amber-700"
                               }`}
                >
                  {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
                </div>
                <span className="text-xs text-amber-800 hidden md:block font-medium">
                  {s.title}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-amber-200 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-green-600 h-1.5 rounded-full transition-all duration-300 shadow-sm"
              style={{
                width: `${((step - 1) / (STEPS.length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-2xl mx-auto px-6 py-12 pb-32">
        <p className="text-sm text-amber-700 font-medium mb-2">
          Step {step} of {STEPS.length}
        </p>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-green-700 bg-clip-text text-transparent mb-10">
          {STEPS[step - 1].title}
        </h1>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-6 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Step 1: About */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-amber-900 mb-2">
                Property title
              </label>
              <input
                value={formValues.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Beautiful apartment in Douala"
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl text-gray-900
                           placeholder-amber-400 focus:outline-none focus:border-orange-500
                           transition-colors text-base bg-white shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-900 mb-2">
                Description
              </label>
              <textarea
                value={formValues.description}
                onChange={(e) => update("description", e.target.value)}
                rows={6}
                placeholder="Tell guests about your property..."
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl text-gray-900
                           placeholder-amber-400 focus:outline-none focus:border-orange-500
                           transition-colors text-base resize-none bg-white shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-900 mb-2">
                Property type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {LISTING_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => update("category", cat.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all shadow-sm
                      ${
                        formValues.category === cat.value
                          ? "border-orange-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md"
                          : "border-amber-200 hover:border-orange-400 bg-white"
                      }`}
                  >
                    <span className="text-sm font-semibold text-amber-900">
                      {cat.label_en}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div>
            <label className="block text-sm font-bold text-amber-900 mb-2">
              Location
            </label>
            <input
              value={formValues.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="e.g., Douala, Yaoundé, Bafoussam"
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl text-gray-900
                         placeholder-amber-400 focus:outline-none focus:border-orange-500
                         transition-colors text-base bg-white shadow-sm"
            />
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div>
            {counterFields.map(({ key, label, min }) => (
              <div
                key={key}
                className="flex items-center justify-between py-5 border-b-2 border-amber-100"
              >
                <span className="font-semibold text-amber-900">{label}</span>
                <div className="flex items-center gap-5">
                  <button
                    type="button"
                    onClick={() =>
                      update(
                        key,
                        String(Math.max(min, Number(formValues[key]) - 1))
                      )
                    }
                    className="w-8 h-8 rounded-full border-2 border-amber-300 flex items-center
                               justify-center text-amber-700 hover:border-orange-500 hover:text-orange-600
                               transition-colors text-lg disabled:opacity-30 bg-white shadow-sm"
                    disabled={Number(formValues[key]) <= min}
                    aria-label={`Decrease ${label}`}
                  >
                    −
                  </button>
                  <span className="text-amber-900 font-bold w-6 text-center">
                    {formValues[key]}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      update(key, String(Number(formValues[key]) + 1))
                    }
                    className="w-8 h-8 rounded-full border-2 border-amber-300 flex items-center
                               justify-center text-amber-700 hover:border-orange-500 hover:text-orange-600
                               transition-colors text-lg bg-white shadow-sm"
                    aria-label={`Increase ${label}`}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Amenities */}
        {step === 4 && (
          <div className="grid grid-cols-2 gap-3">
            {AMENITIES.map((amenity) => {
              const isSelected = selectedAmenities.includes(amenity.key);
              return (
                <button
                  key={amenity.key}
                  type="button"
                  onClick={() => toggleAmenity(amenity.key)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left shadow-sm
                    ${
                      isSelected
                        ? "border-orange-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md"
                        : "border-amber-200 hover:border-orange-400 bg-white"
                    }`}
                >
                  <span className="text-sm font-semibold text-amber-900">
                    {amenity.label_en}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 5: Photos */}
        {step === 5 && (
          <div>
            <label
              htmlFor="image-upload"
              className="block border-2 border-dashed border-amber-300 rounded-2xl p-8 sm:p-16
                            text-center hover:border-orange-500 transition-all cursor-pointer
                            active:bg-amber-50 touch-manipulation bg-gradient-to-br from-white to-amber-50 shadow-sm"
              style={{ minHeight: '44px' }}
            >
              <Upload className="w-10 h-10 mx-auto mb-4 text-orange-500" />
              <span className="text-orange-600 font-bold block">
                Upload photos
              </span>
              <p className="text-amber-700 text-sm mt-1">
                PNG, JPG up to 4MB &middot; max 10 photos
              </p>
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              disabled={uploading}
              style={{ minHeight: '44px', minWidth: '44px' }}
            />
            {uploading && (
              <p className="text-sm text-orange-600 font-medium mt-3 text-center">
                Uploading…
              </p>
            )}
            {images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-green-700 font-semibold mb-3">
                  {images.length} photo{images.length !== 1 ? "s" : ""} uploaded
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((url, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-lg overflow-hidden group"
                    >
                      <Image
                        src={url}
                        alt={`Upload ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 33vw, 200px"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center
                                   justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity
                                   hover:bg-red-50 shadow-sm"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 6: Pricing */}
        {step === 6 && (
          <div>
            <label className="block text-sm font-bold text-amber-900 mb-2">
              Price per night (XAF)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-700 font-bold text-sm">
                FCFA
              </span>
              <input
                type="number"
                value={formValues.price_per_night}
                onChange={(e) => update("price_per_night", e.target.value)}
                min="1000"
                placeholder="0"
                className="w-full pl-16 pr-4 py-4 border-2 border-amber-200 rounded-xl text-gray-900
                           text-2xl font-bold focus:outline-none focus:border-orange-500
                           transition-colors bg-white shadow-sm"
              />
            </div>
            <p className="text-sm text-amber-700 mt-2">
              Set a competitive price to attract your first guests. Minimum
              1,000 FCFA.
            </p>
            <div className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4 shadow-sm">
              <p className="text-sm text-amber-900 font-bold">
                What happens next?
              </p>
              <p className="text-sm text-amber-800 mt-1">
                After you submit, our team will review your listing within 24–48
                hours. You&apos;ll be notified once it&apos;s approved and live
                on the platform.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom nav - ALWAYS VISIBLE */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-amber-50 via-white to-orange-50 border-t-2 border-amber-300 z-[9999] shadow-lg"
        style={{ 
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between gap-3 max-w-2xl mx-auto">
            <button
              type="button"
              onClick={() => {
                console.log('Back clicked, current step:', step);
                setStep((s) => Math.max(1, s - 1));
                setError(null);
              }}
              disabled={step === 1}
              className="flex-1 px-4 py-4 border-2 border-amber-400 rounded-xl text-amber-900
                         font-bold text-base hover:bg-amber-50 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all active:scale-95 bg-white shadow-sm"
            >
              Back
            </button>

            {step < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1 px-4 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-base
                           hover:from-amber-600 hover:to-orange-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || uploading}
                className="flex-1 px-4 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold text-base
                           hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all active:scale-95 shadow-md"
              >
                {submitting ? "Submitting…" : "Submit"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
