"use client";

import { useDict } from "@/lib/i18n/use-dict";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { locale, setLocale } = useDict();

  return (
    <button
      onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      aria-label="Switch language"
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-medium">{locale === "fr" ? "FR" : "EN"}</span>
    </button>
  );
}
