"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2, Upload, ImageIcon, Loader2, Folder, FolderOpen, ChevronRight } from "lucide-react";
import Image from "next/image";

interface SiteImage {
  id: string;
  url: string;
  type: "hero" | "city";
  label: string | null;
  sort_order: number;
}

const CITY_OPTIONS = [
  "Douala", "Yaoundé", "Bamenda", "Buea", "Limbe",
  "Kribi", "Bafoussam", "Garoua", "Maroua", "Bertoua",
];

export default function AdminImagesPage() {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [type, setType] = useState<"hero" | "city">("hero");
  const [label, setLabel] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const [heroOpen, setHeroOpen] = useState(true);
  const [cityOpen, setCityOpen] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    const res = await fetch("/api/admin/site-images");
    const data = await res.json();
    setImages(data.images ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const handleUpload = async () => {
    if (!files.length) return;
    if (type === "city" && !label) { alert("Select a city"); return; }
    setUploading(true);
    try {
      await Promise.all(
        files.map((file) => {
          const fd = new FormData();
          fd.append("file", file);
          fd.append("type", type);
          if (label) fd.append("label", label);
          return fetch("/api/admin/site-images", { method: "POST", body: fd });
        })
      );
      setFiles([]);
      setLabel("");
      await fetchImages();
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this image?")) return;
    await fetch(`/api/admin/site-images?id=${id}`, { method: "DELETE" });
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const heroImages = images.filter((i) => i.type === "hero");
  const cityImages = images.filter((i) => i.type === "city");

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Site Images</h1>

      {/* Upload panel */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-10">
        <h2 className="font-semibold text-gray-900 mb-4">Upload Images</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Type</label>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value as "hero" | "city"); setLabel(""); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              <option value="hero">Hero Slideshow</option>
              <option value="city">City Card</option>
            </select>
          </div>
          {type === "city" && (
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">City</label>
              <select
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
              >
                <option value="">Select city</option>
                {CITY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          {type === "hero" && (
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Caption (optional)</label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Kribi Beach"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none w-48"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300
                            rounded-xl cursor-pointer hover:border-[#166534] transition-colors text-sm text-gray-600">
            <ImageIcon className="w-4 h-4" />
            {files.length > 0 ? `${files.length} file(s) selected` : "Choose photos"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
          </label>
          <button
            onClick={handleUpload}
            disabled={uploading || !files.length}
            className="flex items-center gap-2 px-5 py-2 bg-[#166534] text-white rounded-xl
                       text-sm font-semibold disabled:opacity-50 hover:bg-[#15803D] transition-colors"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
        <>
          {/* Hero images */}
          <section className="mb-6">
            <button
              onClick={() => setHeroOpen((o) => !o)}
              className="flex items-center gap-2 w-full text-left mb-2 group"
            >
              {heroOpen
                ? <FolderOpen className="w-5 h-5 text-amber-400" />
                : <Folder className="w-5 h-5 text-amber-400" />}
              <span className="font-semibold text-gray-900">Hero Slideshow</span>
              <span className="text-gray-400 font-normal text-sm">({heroImages.length})</span>
              <ChevronRight className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${heroOpen ? "rotate-90" : ""}`} />
            </button>

            {heroOpen && (
              <div className="ml-6 border-l-2 border-gray-100 pl-4">
                {heroImages.length === 0 ? (
                  <p className="text-gray-400 text-sm py-2">No hero images yet.</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {heroImages.map((img) => {
                      const filename = img.label || img.url.split("/").pop() || "image";
                      return (
                        <div key={img.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 group/row">
                          <ImageIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <button
                            onClick={() => setPreview(preview === img.url ? null : img.url)}
                            className="text-sm text-gray-700 truncate flex-1 text-left hover:text-[#166534]"
                          >
                            {filename}
                          </button>
                          <button
                            onClick={() => handleDelete(img.id)}
                            className="w-6 h-6 text-red-400 hover:text-red-600 opacity-0 group-hover/row:opacity-100 transition-opacity flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Preview lightbox */}
            {preview && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={() => setPreview(null)}>
                <div className="relative max-w-3xl max-h-[80vh] w-full mx-4">
                  <img src={preview} alt="preview" className="w-full h-full object-contain rounded-xl" />
                </div>
              </div>
            )}
          </section>

          {/* City images */}
          <section>
            <button
              onClick={() => setCityOpen((o) => !o)}
              className="flex items-center gap-2 w-full text-left mb-2"
            >
              {cityOpen
                ? <FolderOpen className="w-5 h-5 text-amber-400" />
                : <Folder className="w-5 h-5 text-amber-400" />}
              <span className="font-semibold text-gray-900">City Cards</span>
              <span className="text-gray-400 font-normal text-sm">({cityImages.length})</span>
              <ChevronRight className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${cityOpen ? "rotate-90" : ""}`} />
            </button>

            {cityOpen && (
              <div className="ml-6 border-l-2 border-gray-100 pl-4">
                {cityImages.length === 0 ? (
                  <p className="text-gray-400 text-sm py-2">No city images yet.</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {cityImages.map((img) => (
                      <div key={img.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 group/row">
                        <ImageIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <button
                          onClick={() => setPreview(preview === img.url ? null : img.url)}
                          className="text-sm text-gray-700 truncate flex-1 text-left hover:text-[#166534]"
                        >
                          {img.label || img.url.split("/").pop() || "image"}
                        </button>
                        <button
                          onClick={() => handleDelete(img.id)}
                          className="w-6 h-6 text-red-400 hover:text-red-600 opacity-0 group-hover/row:opacity-100 transition-opacity flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
