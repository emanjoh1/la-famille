"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { submitKYC } from "@/actions/kyc";
import { useUploadThing } from "@/lib/uploadthing";
import { CheckCircle, Camera, CreditCard, User, ChevronRight } from "lucide-react";

const STEPS = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "ID Card", icon: CreditCard },
  { id: 3, title: "Face Scan", icon: Camera },
];

export default function KYCForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [selfiePreview, setSelfiePreview] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    date_of_birth: "",
    phone_number: "",
    address: "",
    city: "",
    country: "Cameroon",
    id_card_front_url: "",
    id_card_back_url: "",
    selfie_url: "",
  });

  const { startUpload } = useUploadThing("kycDocuments");

  const inputClass =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent";

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "id_card_front_url" | "id_card_back_url" | "selfie_url"
  ) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded = await startUpload(Array.from(files));
      if (uploaded?.[0]?.url) {
        if (field === "selfie_url") {
          setSelfiePreview(URL.createObjectURL(files[0]));
        }
        setFormData((prev) => ({ ...prev, [field]: uploaded[0].url }));
      }
    } catch {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch {
      alert("Could not access camera. Please allow camera permissions.");
    }
  };

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  const captureSelfie = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      setUploading(true);
      stopCamera();
      try {
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        const uploaded = await startUpload([file]);
        if (uploaded?.[0]?.url) {
          setSelfiePreview(URL.createObjectURL(blob));
          setFormData((prev) => ({ ...prev, selfie_url: uploaded[0].url }));
        }
      } catch {
        alert("Selfie upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    }, "image/jpeg", 0.9);
  };

  const canProceed = () => {
    if (step === 1) return !!(formData.full_name && formData.date_of_birth && formData.phone_number && formData.address && formData.city);
    if (step === 2) return !!(formData.id_card_front_url && formData.id_card_back_url);
    if (step === 3) return !!formData.selfie_url;
    return false;
  };

  const handleSubmit = async () => {
    if (!formData.selfie_url) { alert("Please complete the face scan"); return; }
    setLoading(true);
    try {
      await submitKYC(formData);
      router.refresh();
    } catch {
      alert("Failed to submit. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex items-center justify-between mb-6">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                ${step > s.id ? "bg-green-500 text-white" : step === s.id ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                {step > s.id ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
              </div>
              <span className="text-xs font-medium text-gray-600">{s.title}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-16 mx-2 mb-4 ${step > s.id ? "bg-green-500" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input type="text" required value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className={inputClass} placeholder="Enter your full legal name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
            <input type="date" required value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input type="tel" required value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              className={inputClass} placeholder="+237 XXX XXX XXX" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input type="text" required value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={inputClass} placeholder="Street address" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input type="text" required value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={inputClass} placeholder="Douala" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
              <input type="text" required value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className={inputClass} />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: ID Card */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
            📋 Upload clear photos of both sides of your national ID card or passport.
          </p>
          {(["id_card_front_url", "id_card_back_url"] as const).map((field) => {
            const label = field === "id_card_front_url" ? "ID Card (Front)" : "ID Card (Back)";
            const url = formData[field];
            return (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label} *</label>
                {url ? (
                  <div className="relative">
                    <img src={url} alt={label} className="w-full h-48 object-cover rounded-lg" />
                    <button type="button" onClick={() => setFormData({ ...formData, [field]: "" })}
                      className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm">
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-amber-300 rounded-lg p-6 text-center cursor-pointer hover:border-amber-500">
                    <input type="file" accept="image/*" capture="environment" className="hidden"
                      onChange={(e) => handleUpload(e, field)} disabled={uploading} />
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                    <p className="text-amber-700 font-medium">{uploading ? "Uploading..." : `Upload ${label}`}</p>
                    <p className="text-gray-500 text-sm mt-1">PNG, JPG up to 4MB</p>
                  </label>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Step 3: Face Scan */}
      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
            🤳 Take a selfie to verify your identity matches your ID card. Ensure your face is clearly visible and well-lit.
          </p>


          {formData.selfie_url ? (
            <div className="space-y-3">
              <div className="relative">
                <img src={selfiePreview || formData.selfie_url} alt="Selfie"
                  className="w-full h-64 object-cover rounded-xl" />
                <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Verified
                </div>
              </div>
              <button type="button"
                onClick={() => { setFormData({ ...formData, selfie_url: "" }); setSelfiePreview(""); }}
                className="w-full border-2 border-amber-300 text-amber-700 py-3 rounded-lg font-medium hover:bg-amber-50">
                Retake Photo
              </button>
            </div>
          ) : cameraActive ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-64 object-cover scale-x-[-1]" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-56 border-4 border-white rounded-full opacity-60" />
                </div>
                <p className="absolute bottom-3 left-0 right-0 text-center text-white text-sm font-medium drop-shadow">
                  Position your face in the oval
                </p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={stopCamera}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium">
                  Cancel
                </button>
                <button type="button" onClick={captureSelfie} disabled={uploading}
                  className="flex-1 bg-amber-500 text-white py-3 rounded-lg font-semibold hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2">
                  <Camera className="w-5 h-5" />
                  {uploading ? "Uploading..." : "Capture"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button type="button" onClick={startCamera}
                className="w-full border-2 border-dashed border-amber-300 rounded-xl p-10 text-center hover:border-amber-500 hover:bg-amber-50 transition-all">
                <Camera className="w-12 h-12 mx-auto mb-3 text-amber-500" />
                <p className="text-amber-700 font-semibold text-lg">Take a Selfie</p>
                <p className="text-gray-500 text-sm mt-1">Opens front camera for live verification</p>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        {step > 1 && (
          <button type="button" onClick={() => { stopCamera(); setStep((s) => s - 1); }}
            className="flex-1 border-2 border-amber-300 text-amber-800 py-3 rounded-lg font-semibold hover:bg-amber-50">
            Back
          </button>
        )}
        {step < 3 ? (
          <button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={loading || !canProceed()}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Submitting..." : "Submit Verification"}
          </button>
        )}
      </div>
    </div>
  );
}
