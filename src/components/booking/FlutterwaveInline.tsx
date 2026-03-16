"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: Record<string, unknown>) => { close: () => void };
  }
}

interface FlutterwaveInlineProps {
  bookingId: string;
  onSuccess: () => void;
  onClose?: () => void;
  className?: string;
  label?: string;
}

function loadFlutterwaveSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.FlutterwaveCheckout) { resolve(); return; }

    const existing = document.querySelector('script[src="https://checkout.flutterwave.com/v3.js"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://checkout.flutterwave.com/v3.js";
      document.body.appendChild(script);
    }

    // Poll until available or timeout
    let attempts = 0;
    const interval = setInterval(() => {
      if (window.FlutterwaveCheckout) {
        clearInterval(interval);
        resolve();
      } else if (++attempts > 50) { // 5 seconds
        clearInterval(interval);
        reject(new Error("Payment SDK timed out. Check your internet connection."));
      }
    }, 100);
  });
}

export function FlutterwaveInline({
  bookingId,
  onSuccess,
  onClose,
  className,
  label = "Complete Payment",
}: FlutterwaveInlineProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setError(null);
    setLoading(true);
    try {
      await loadFlutterwaveSDK();

      const res = await fetch("/api/bookings/flutterwave-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const config = await res.json();
      if (config.error) throw new Error(config.error);

      setLoading(false);

      window.FlutterwaveCheckout!({
        ...config,
        redirect_url: undefined,
        callback: async (response: { status: string; transaction_id: number }) => {
          if (response.status === "successful" || response.status === "completed") {
            // Verify server-side and update booking
            const confirm = await fetch("/api/bookings/confirm-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookingId,
                transactionId: response.transaction_id,
              }),
            });
            const result = await confirm.json();
            if (result.success) {
              onSuccess();
            } else {
              setError(result.error || "Payment verification failed.");
            }
          } else {
            setError("Payment was not completed.");
          }
        },
        onclose: () => onClose?.(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payment.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handlePay}
        disabled={loading}
        className={cn(
          "px-4 py-2 bg-gradient-to-r from-[#166534] to-[#15803D] text-white rounded-xl",
          "text-sm font-semibold hover:shadow-md transition-all disabled:opacity-50 flex items-center gap-2",
          className
        )}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Loading..." : label}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
