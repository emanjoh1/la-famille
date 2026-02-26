"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function PlatformError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Platform Error]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-[#1E3A8A]" />
        </div>

        <h1 className="text-2xl font-semibold text-[#222222] mb-3">
          Something went wrong
        </h1>
        <p className="text-[#717171] mb-8 leading-relaxed">
          We ran into an unexpected error. Please try again or go back to
          explore.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#1E3A8A] text-white rounded-xl font-medium
                       hover:bg-[#1E40AF] transition-colors"
          >
            Try again
          </button>
          <Link
            href="/explore"
            className="px-6 py-3 border border-[#222222] text-[#222222] rounded-xl
                       font-medium hover:bg-[#F7F7F7] transition-colors"
          >
            Go to explore
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-[#DDDDDD]">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
