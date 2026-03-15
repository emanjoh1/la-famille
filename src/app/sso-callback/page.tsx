"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 bg-gradient-to-br from-[#166534] to-[#15803D] rounded-xl flex items-center justify-center">
          <span className="text-xl">🏠</span>
        </div>
        <div className="w-6 h-6 border-2 border-[#166534] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#717171]">Signing you in…</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
