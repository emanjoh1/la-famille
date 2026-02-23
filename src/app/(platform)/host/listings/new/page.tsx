"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createListing } from "@/actions/listings";
import { useUploadThing } from "@/lib/uploadthing";

export default function NewListingPage() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const { startUpload } = useUploadThing("listingImages");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const uploaded = await startUpload(Array.from(files));
    if (uploaded) {
      setImages([...images, ...uploaded.map((f) => f.url)]);
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("images", JSON.stringify(images));
    formData.append("amenities", JSON.stringify([]));

    await createListing(formData);
    router.push("/host/listings");
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Create New Listing</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            name="title"
            type="text"
            required
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Beautiful family home..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            required
            className="w-full px-4 py-2 border rounded-lg"
            rows={4}
            placeholder="Describe your property..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <input
            name="location"
            type="text"
            required
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="e.g., Douala, Yaoundé, Bafoussam"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Bedrooms</label>
            <input
              name="bedrooms"
              type="number"
              required
              min="1"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Bathrooms</label>
            <input
              name="bathrooms"
              type="number"
              required
              min="1"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Guests</label>
            <input
              name="max_guests"
              type="number"
              required
              min="1"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Price per Night (XAF)</label>
          <input
            name="price_per_night"
            type="number"
            required
            min="1"
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="w-full px-4 py-2 border rounded-lg"
          />
          {uploading && <p className="text-sm text-gray-600 mt-2">Uploading...</p>}
          {images.length > 0 && (
            <p className="text-sm text-green-600 mt-2">{images.length} images uploaded</p>
          )}
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          Create Listing
        </button>
      </form>
    </div>
  );
}
