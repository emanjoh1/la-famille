"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateListing, toggleListingSnooze, deleteListing } from "@/actions/listings";
import { useUploadThing } from "@/lib/uploadthing";
import { LISTING_CATEGORIES, AMENITIES } from "@/lib/utils/constants";
import {
  Upload,
  Home,
  MapPin,
  Users,
  DollarSign,
  Sparkles,
  X,
  Pause,
  Play,
  Trash2,
  AlertCircle,
} from "lucide-react";

type FormField =
  | "title"
  | "description"
  | "location"
  | "category"
  | "bedrooms"
  | "bathrooms"
  | "max_guests"
  | "price_per_night";

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [listingId, setListingId] = useState<string | null>(null);
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    params.then((p) => {
      setListingId(p.id);
      fetch(`/api/listings/${p.id}`)
        .then((res) => res.json())
        .then((data) => {
          setListing(data);
          setFormValues({
            title: data.title || "",
            description: data.description || "",
            location: data.location || "",
            category: data.category || "apartment",
            bedrooms: String(data.bedrooms || 1),
            bathrooms: String(data.bathrooms || 1),
            max_guests: String(data.max_guests || 1),
            price_per_night: String(data.price_per_night || ""),
          });
          setImages(data.images || []);
          setSelectedAmenities(data.amenities || []);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load listing");
          setLoading(false);
        });
    });
  }, [params]);

  const update = (k: FormField, v: string) =>
    setFormValues((prev) => ({ ...prev, [k]: v }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    try {
      const uploaded = await startUpload(Array.from(files));
      if (uploaded)
        setImages((prev) => [...prev, ...uploaded.map((f) => f.url)]);
    } catch {
      setError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!listingId) return;
    setError(null);
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(formValues).forEach(([k, v]) => formData.append(k, v));
      formData.append("images", JSON.stringify(images));
      formData.append("amenities", JSON.stringify(selectedAmenities));
      const result = await updateListing(listingId, formData);
      if (result && "error" in result) {
        setError(result.error);
        return;
      }
      router.push("/host/listings");
      router.refresh();
    } catch (err) {
      console.error("Update error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSnooze = async () => {
    if (!listingId) return;
    try {
      const newStatus = await toggleListingSnooze(listingId);
      setListing({ ...listing, status: newStatus });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update status";
      setError(msg);
    }
  };

  const handleDelete = async () => {
    if (!listingId) return;
    if (!confirm("Are you sure you want to delete this listing? This cannot be undone.")) return;
    try {
      await deleteListing(listingId);
      router.push("/host/listings");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete listing";
      setError(msg);
    }
  };

  const toggleAmenity = (key: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const counterFields: { key: FormField; label: string; min: number }[] = [
    { key: "bedrooms", label: "Bedrooms", min: 1 },
    { key: "bathrooms", label: "Bathrooms", min: 1 },
    { key: "max_guests", label: "Max guests", min: 1 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[#717171]">Loading...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-red-600">Listing not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-[#222222]">Edit listing</h1>
          <div className="flex gap-2">
            {listing.status === "approved" && (
              <button
                onClick={handleSnooze}
                className="flex items-center gap-2 px-4 py-2 border border-[#DDDDDD] rounded-xl
                           text-[#222222] hover:bg-[#F7F7F7] transition-colors"
              >
                <Pause className="w-4 h-4" />
                Snooze
              </button>
            )}
            {listing.status === "snoozed" && (
              <button
                onClick={handleSnooze}
                className="flex items-center gap-2 px-4 py-2 border border-green-500 rounded-xl
                           text-green-600 hover:bg-green-50 transition-colors"
              >
                <Play className="w-4 h-4" />
                Activate
              </button>
            )}
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 border border-red-500 rounded-xl
                         text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* About */}
          <section>
            <h2 className="text-xl font-semibold text-[#222222] mb-4">About your place</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#222222] mb-2">
                  Property title
                </label>
                <input
                  value={formValues.title}
                  onChange={(e) => update("title", e.target.value)}
                  className="w-full px-4 py-3 border border-[#DDDDDD] rounded-xl text-[#222222]
                             focus:outline-none focus:border-[#222222] transition-colors"
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
                  className="w-full px-4 py-3 border border-[#DDDDDD] rounded-xl text-[#222222]
                             focus:outline-none focus:border-[#222222] transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#222222] mb-2">
                  Property type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {LISTING_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => update("category", cat.value)}
                      className={`p-4 rounded-xl border text-left transition-colors
                        ${
                          formValues.category === cat.value
                            ? "border-[#222222] bg-[#F7F7F7]"
                            : "border-[#DDDDDD] hover:border-[#222222]"
                        }`}
                    >
                      <span className="text-sm font-medium text-[#222222]">
                        {cat.label_en}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Location */}
          <section>
            <h2 className="text-xl font-semibold text-[#222222] mb-4">Location</h2>
            <input
              value={formValues.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="e.g., Douala, Yaoundé, Bafoussam"
              className="w-full px-4 py-3 border border-[#DDDDDD] rounded-xl text-[#222222]
                         focus:outline-none focus:border-[#222222] transition-colors"
            />
          </section>

          {/* Details */}
          <section>
            <h2 className="text-xl font-semibold text-[#222222] mb-4">Details</h2>
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
                               transition-colors disabled:opacity-30"
                    disabled={Number(formValues[key]) <= min}
                  >
                    −
                  </button>
                  <span className="text-[#222222] font-medium w-6 text-center">
                    {formValues[key]}
                  </span>
                  <button
                    type="button"
                    onClick={() => update(key, String(Number(formValues[key]) + 1))}
                    className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center
                               justify-center text-[#717171] hover:border-[#222222] hover:text-[#222222]
                               transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </section>

          {/* Amenities */}
          <section>
            <h2 className="text-xl font-semibold text-[#222222] mb-4">Amenities</h2>
            <div className="grid grid-cols-2 gap-3">
              {AMENITIES.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity.key);
                return (
                  <button
                    key={amenity.key}
                    type="button"
                    onClick={() => toggleAmenity(amenity.key)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-colors text-left
                      ${
                        isSelected
                          ? "border-[#222222] bg-[#F7F7F7]"
                          : "border-[#DDDDDD] hover:border-[#222222]"
                      }`}
                  >
                    <span className="text-sm font-medium text-[#222222]">
                      {amenity.label_en}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Photos */}
          <section>
            <h2 className="text-xl font-semibold text-[#222222] mb-4">Photos</h2>
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {images.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                    <Image
                      src={url}
                      alt={`Upload ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                    <button
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
            )}
            <label
              htmlFor="image-upload"
              className="block border-2 border-dashed border-[#DDDDDD] rounded-2xl p-12
                         text-center hover:border-[#222222] transition-colors cursor-pointer"
            >
              <Upload className="w-8 h-8 mx-auto mb-3 text-[#717171]" />
              <span className="text-[#1E3A8A] font-semibold block">Add more photos</span>
              <p className="text-[#717171] text-sm mt-1">PNG, JPG up to 4MB</p>
            </label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              disabled={uploading}
            />
          </section>

          {/* Pricing */}
          <section>
            <h2 className="text-xl font-semibold text-[#222222] mb-4">Pricing</h2>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#717171] font-medium text-sm">
                FCFA
              </span>
              <input
                type="number"
                value={formValues.price_per_night}
                onChange={(e) => update("price_per_night", e.target.value)}
                min="1000"
                className="w-full pl-16 pr-4 py-4 border border-[#DDDDDD] rounded-xl text-[#222222]
                           text-2xl font-semibold focus:outline-none focus:border-[#222222]
                           transition-colors"
              />
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            <button
              onClick={() => router.push("/host/listings")}
              className="flex-1 px-6 py-3 border border-[#222222] rounded-xl text-[#222222]
                         font-medium hover:bg-[#F7F7F7] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || uploading}
              className="flex-1 px-6 py-3 bg-[#1E3A8A] text-white rounded-xl font-medium
                         hover:bg-[#1E40AF] disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
            >
              {submitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
