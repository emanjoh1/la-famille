"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveKYC, rejectKYC } from "@/actions/kyc";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function KYCAdminActions({ kycId }: { kycId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading("approve");
    setError(null);
    try {
      await approveKYC(kycId);
      router.refresh();
    } catch {
      setError("Failed to approve. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    setLoading("reject");
    setError(null);
    try {
      await rejectKYC(kycId, reason.trim() || undefined);
      setShowRejectModal(false);
      router.refresh();
    } catch {
      setError("Failed to reject. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={handleApprove}
          disabled={loading !== null}
          className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white text-sm font-medium
                     rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading === "approve" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Approve
        </button>
        <button
          onClick={() => setShowRejectModal(true)}
          disabled={loading !== null}
          className="flex items-center gap-2 px-5 py-2 border border-red-300 text-red-600 text-sm
                     font-medium rounded-xl hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <XCircle className="w-4 h-4" />
          Reject
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowRejectModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
            <h3 className="text-lg font-semibold text-[#222222] mb-2">Reject KYC submission</h3>
            <p className="text-sm text-[#717171] mb-4">
              Optionally tell the host why their verification was rejected.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., ID photo is blurry. Please re-upload a clearer image."
              rows={4}
              className="w-full px-4 py-3 border border-[#DDDDDD] rounded-xl text-sm text-[#222222]
                         placeholder-[#717171] focus:outline-none focus:border-[#222222] resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-5 py-2 text-sm font-medium text-[#222222] border border-[#DDDDDD]
                           rounded-xl hover:bg-[#F7F7F7] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={loading === "reject"}
                className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white text-sm font-medium
                           rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading === "reject" && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
