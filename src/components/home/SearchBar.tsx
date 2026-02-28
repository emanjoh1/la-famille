"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { useLanguageContext } from "@/lib/i18n/provider";

export function SearchBar({ today }: { today: string }) {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");
  const { t } = useLanguageContext();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", guests);

    router.push(`/explore?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-2">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 px-5 py-3 hover:bg-gray-50 rounded-xl transition-colors">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#166534]" />
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-900 mb-1">{t("search.where")}</p>
                <input
                  type="text"
                  placeholder={t("search.search_destinations")}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-sm text-gray-600 placeholder-gray-400 bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="px-5 py-3 hover:bg-gray-50 rounded-xl transition-colors">
            <label className="text-xs font-bold text-gray-900 mb-1 block">{t("booking.check_in")}</label>
            <input
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (checkOut && e.target.value >= checkOut) setCheckOut("");
              }}
              className="w-full text-sm text-gray-600 bg-transparent focus:outline-none"
            />
          </div>

          <div className="px-5 py-3 hover:bg-gray-50 rounded-xl transition-colors">
            <label className="text-xs font-bold text-gray-900 mb-1 block">{t("booking.check_out")}</label>
            <input
              type="date"
              min={checkIn || today}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              disabled={!checkIn}
              className="w-full text-sm text-gray-600 bg-transparent focus:outline-none disabled:opacity-50"
            />
          </div>

          <div className="flex items-center gap-3 px-5 py-3">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-900 mb-1 block">{t("booking.guests")}</label>
              <input
                type="number"
                min="1"
                placeholder="1"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full text-sm text-gray-600 bg-transparent focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="p-4 bg-gradient-to-r from-[#166534] to-[#15803D] text-white rounded-xl
                         hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
