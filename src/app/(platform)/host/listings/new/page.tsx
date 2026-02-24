"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createListing } from "@/actions/listings";
import { useUploadThing } from "@/lib/uploadthing";
import {
  Upload,
  Home,
  MapPin,
  Users,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

const STEPS = [
  { id: 1, title: "About your place", icon: Home },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "Details", icon: Users },
  { id: 4, title: "Photos", icon: Upload },
  { id: 5, title: "Pricing", icon: DollarSign },
];

type FormField =
  | "title"
  | "description"
  | "location"
  | "bedrooms"
  | "bathrooms"
  | "max_guests"
  | "price_per_night";

export default function NewListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { startUpload } = useUploadThing("listingImages");

  const [formValues, setFormValues] = useState<Record<FormField, string>>({
    title: "",
    description: "",
    location: "",
    bedrooms: "1",
    bathrooms: "1",
    max_guests: "1",
    price_per_night: "",
  });

  const update = (k: FormField, v: string) =>
    setFormValues((prev) => ({ ...prev, [k]: v }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    try {
      const uploaded = await startUpload(Array.from(files));
      if (uploaded) setImages((prev) => [...prev, ...uploaded.map((f) => f.url)]);
    } catch {
      setError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(formValues).forEach(([k, v]) => formData.append(k, v));
      formData.append("images", JSON.stringify(images));
      formData.append("amenities", JSON.stringify([]));
      await createListing(formData);
      setSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const counterFields: { key: FormField; label: string; min: number }[] = [
    { key: "bedrooms", label: "Bedrooms", min: 1 },
    { key: "bathrooms", label: "Bathrooms", min: 1 },
    { key: "max_guests", label: "Max guests", min: 1 },
  ];

  // ── Success screen ──────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-2xl font-semibold text-[#222222] mb-3">
            Submitted for review!
          </h1>
          <p className="text-[#717171] mb-8 leading-relaxed">
            Your property has been submitted and is under review. We&apos;ll approve it
            within 24–48 hours and notify you once it&apos;s live.
          </p>
          <button
            onClick={() => router.push("/host/listings")}
            className="px-8 py-3 bg-[#222222] text-white rounded-xl font-medium
                       hover:bg-black transition-colors"
          >
            Back to my listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky top progress bar */}
      <div className="sticky top-20 bg-white border-b border-[#DDDDDD] z-40">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                               transition-colors
                               ${
                                 step > s.id
                                   ? "bg-[#222222] text-white"
                                   : step === s.id
                                   ? "bg-[#FF385C] text-white"
                                   : "border-2 border-[#DDDDDD] text-[#717171]"
                               }`}
                >
                  {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
                </div>
                <span className="text-xs text-[#717171] hidden md:block">{s.title}</span>
              </div>
            ))}
          </div>
          <div className="w-full bg-[#DDDDDD] rounded-full h-1">
            <div
              className="bg-[#FF385C] h-1 rounded-full transition-all duration-300"
              style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-2xl mx-auto px-6 py-12 pb-32">
        <p className="text-sm text-[#717171] mb-2">Step {step} of {STEPS.length}</p>
        <h1 className="text-3xl font-semibold text-[#222222] mb-10">
          {STEPS[step - 1].title}
        </h1>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Step 1: About */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#222222] mb-2">
                Property title
              </label>
              <input
                value={formValues.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Beautiful apartment in Douala"
                className="w-full px-4 py-3 border border-[#DDDDDD] rounded-xl text-[#222222]
                           placeholder-[#717171] focus:outline-none focus:border-[#222222]
                           transition-colors text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#222222] mb-2">
                Description
              </label>
              <textarea
                value={formValues.description}
                onChange={(e) => update("description", e.target.value)}
                rows={6}
                placeholder="Tell guests about your property..."
                className="w-full px-4 py-3 border border-[#DDDDDD] rounded-xl text-[#222222]
                           placeholder-[#717171] focus:outline-none focus:border-[#222222]
                           transition-colors text-base resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div>
            <label className="block text-sm font-semibold text-[#222222] mb-2">
              Location
            </label>
            <input
              value={formValues.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="e.g., Douala, Yaoundé, Bafoussam"
              className="w-full px-4 py-3 border border-[#DDDDDD] rounded-xl text-[#222222]
                         placeholder-[#717171] focus:outline-none focus:border-[#222222]
                         transition-colors text-base"
            />
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div>
            {counterFields.map(({ key, label, min }) => (
              <div
                key={key}
                className="flex items-center justify-between py-5 border-b border-[#DDDDDD]"
              >
                <span className="font-medium text-[#222222]">{label}</span>
                <div className="flex items-center gap-5">
                  <button
                    type="button"
                    onClick={() =>
                      update(key, String(Math.max(min, Number(formValues[key]) - 1)))
                    }
                    className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center
                               justify-center text-[#717171] hover:border-[#222222] hover:text-[#222222]
                               transition-colors text-lg disabled:opacity-30"
                    disabled={Number(formValues[key]) <= min}
                  >
                    −
                  </button>
                  <span className="text-[#222222] font-medium w-6 text-center">
                    {formValues[key]}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      update(key, String(Number(formValues[key]) + 1))
                    }
                    className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center
                               justify-center text-[#717171] hover:border-[#222222] hover:text-[#222222]
                               transition-colors text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Photos */}
        {step === 4 && (
          <div>
            <div className="border-2 border-dashed border-[#DDDDDD] rounded-2xl p-16
                            text-center hover:border-[#222222] transition-colors">
              <Upload className="w-10 h-10 mx-auto mb-4 text-[#717171]" />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <span className="text-[#FF385C] font-semibold">Upload photos</span>
                <p className="text-[#717171] text-sm mt-1">
                  PNG, JPG up to 4MB · max 10 photos
                </p>
              </label>
            </div>
            {uploading && (
              <p className="text-sm text-[#717171] mt-3 text-center">Uploading…</p>
            )}
            {images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-green-600 font-medium mb-3">
                  ✓ {images.length} photo{images.length !== 1 ? "s" : ""} uploaded
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={url}
                      alt={`Upload ${i + 1}`}
                      className="aspect-square object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Pricing */}
        {step === 5 && (
          <div>
            <label className="block text-sm font-semibold text-[#222222] mb-2">
              Price per night (XAF)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#717171] font-medium text-sm">
                FCFA
              </span>
              <input
                type="number"
                value={formValues.price_per_night}
                onChange={(e) => update("price_per_night", e.target.value)}
                min="1"
                placeholder="0"
                className="w-full pl-16 pr-4 py-4 border border-[#DDDDDD] rounded-xl text-[#222222]
                           text-2xl font-semibold focus:outline-none focus:border-[#222222]
                           transition-colors"
              />
            </div>
            <p className="text-sm text-[#717171] mt-2">
              Set a competitive price to attract your first guests.
            </p>
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800 font-medium">📋 What happens next?</p>
              <p className="text-sm text-amber-700 mt-1">
                After you submit, our team will review your listing within 24–48 hours.
                You&apos;ll be notified once it&apos;s approved and live on the platform.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#DDDDDD] z-40">
        <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => { setStep((s) => Math.max(1, s - 1)); setError(null); }}
            disabled={step === 1}
            className="px-6 py-3 border border-[#222222] rounded-xl text-[#222222]
                       font-medium hover:bg-[#F7F7F7] disabled:opacity-40 disabled:cursor-not-allowed
                       transition-colors"
          >
            Back
          </button>

          {step < STEPS.length ? (
            <button
              onClick={() => { setStep((s) => Math.min(STEPS.length, s + 1)); setError(null); }}
              className="px-8 py-3 bg-[#222222] text-white rounded-xl font-medium
                         hover:bg-black transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || uploading}
              className="px-8 py-3 bg-[#FF385C] text-white rounded-xl font-medium
                         hover:bg-[#E31C5F] disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
            >
              {submitting ? "Submitting…" : "Submit for review"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
