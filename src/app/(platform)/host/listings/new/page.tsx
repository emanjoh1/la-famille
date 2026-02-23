"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createListing } from "@/actions/listings";
import { useUploadThing } from "@/lib/uploadthing";
import { Upload } from "lucide-react";

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
    <div className="container mx-auto px-6 py-8 max-w-3xl">
      <h1 className="text-3xl font-semibold mb-8">List your property</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-lg font-medium mb-3">Property title</label>
          <input
            name="title"
            type="text"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="Beautiful apartment in Douala"
          />
        </div>

        <div>
          <label className="block text-lg font-medium mb-3">Description</label>
          <textarea
            name="description"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            rows={5}
            placeholder="Tell guests about your property..."
          />
        </div>

        <div>
          <label className="block text-lg font-medium mb-3">Location</label>
          <input
            name="location"
            type="text"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="e.g., Douala, Yaoundé, Bafoussam"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-lg font-medium mb-3">Bedrooms</label>
            <input
              name="bedrooms"
              type="number"
              required
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-lg font-medium mb-3">Bathrooms</label>
            <input
              name="bathrooms"
              type="number"
              required
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-lg font-medium mb-3">Guests</label>
            <input
              name="max_guests"
              type="number"
              required
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-lg font-medium mb-3">Price per night (XAF)</label>
          <input
            name="price_per_night"
            type="number"
            required
            min="1"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-lg font-medium mb-3">Photos</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-rose-500 transition">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <span className="text-rose-500 font-medium">Upload photos</span>
              <p className="text-gray-600 text-sm mt-2">or drag and drop</p>
            </label>
          </div>
          {uploading && <p className="text-sm text-gray-600 mt-2">Uploading...</p>}
          {images.length > 0 && (
            <p className="text-sm text-green-600 mt-2">{images.length} photos uploaded</p>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full py-4 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:bg-gray-400 font-medium text-lg transition"
        >
          Publish listing
        </button>
      </form>
    </div>
  );
}
