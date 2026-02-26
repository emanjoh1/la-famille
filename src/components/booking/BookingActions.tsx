"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { updateBookingStatus } from "@/actions/bookings";
import { useRouter } from "next/navigation";

export function BookingActions({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    setLoading(true);
    try {
      const result = await updateBookingStatus(bookingId, "cancelled");
      if ("error" in result) {
        alert(result.error);
        setLoading(false);
        return;
      }
      router.refresh();
    } catch (error) {
      alert("Failed to cancel booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="px-4 py-2 border border-red-300 text-red-600 rounded-xl text-sm font-semibold
                 hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2"
    >
      <X className="w-4 h-4" />
      {loading ? "Canceling..." : "Cancel"}
    </button>
  );
}
