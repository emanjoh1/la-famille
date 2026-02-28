"use client";

import Link from "next/link";
import { Globe, Menu, Search } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useLanguageContext } from "@/lib/i18n/provider";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const { user } = useUser();
  const isAdmin = (user?.publicMetadata?.role as string) === "admin";
  const { locale, setLocale, t } = useLanguageContext();

  const toggleLanguage = () => {
    setLocale(locale === "fr" ? "en" : "fr");
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    window.location.href = `/explore${params.toString() ? `?${params}` : ""}`;
  };

  return (
    <nav className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20 gap-4">

          {/* Left: Logo */}
          <Link href="/explore" className="flex-shrink-0 flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#166534] to-[#15803D] rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-xl">🏠</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#166534] to-[#15803D] bg-clip-text text-transparent">La Famille</span>
          </Link>

          {/* Center: Search pill */}
          <div className="hidden md:flex items-stretch border border-gray-200 rounded-full
                          shadow-sm hover:shadow-lg transition-all duration-200 divide-x divide-gray-200
                          flex-1 max-w-2xl bg-white">
            <input
              type="text"
              placeholder={t("nav.where_to")}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 px-5 py-3 text-sm text-gray-900 placeholder-gray-400 rounded-l-full focus:outline-none"
            />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="px-5 py-3 text-sm text-gray-900 focus:outline-none"
            />
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="px-5 py-3 text-sm text-gray-900 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              className="px-5 py-3 bg-gradient-to-r from-[#166534] to-[#15803D] text-white rounded-r-full
                         hover:from-[#15803D] hover:to-[#D97706] transition-all duration-200 hover:shadow-md"
              aria-label={t("common.search")}
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Right: Host link + Globe + Hamburger menu */}
          <div className="flex items-center gap-2">
            {!user ? (
              // Show Sign Up button for guests
              <Link
                href="/auth"
                className="px-6 py-3 bg-gradient-to-r from-[#166534] to-[#15803D] text-white rounded-full text-sm font-semibold
                           hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md"
              >
                {t("common.sign_up")}
              </Link>
            ) : (
              <>
                <Link
                  href="/host/listings"
                  className="hidden md:block px-5 py-2.5 text-sm font-semibold text-gray-700
                             rounded-full hover:bg-gray-100 transition-all duration-200"
                >
                  {t("nav.become_host")}
                </Link>
                <button
                  onClick={toggleLanguage}
                  className="p-3 rounded-full hover:bg-gray-100 transition-all duration-200 hidden md:flex items-center justify-center gap-1.5"
                  aria-label={t("nav.language")}
                >
                  <Globe className="w-5 h-5 text-gray-700" />
                  <span className="text-xs font-bold text-gray-700 uppercase">{locale}</span>
                </button>

                {/* Hamburger + Avatar */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-3 border border-gray-200 rounded-full
                               px-4 py-2 hover:shadow-md transition-all duration-200 bg-white"
                  >
                    <Menu className="w-5 h-5 text-gray-700" />
                    <UserButton afterSignOutUrl="/" />
                  </button>

                  {menuOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setMenuOpen(false)}
                      />
                      {/* Dropdown */}
                      <div className="absolute right-0 top-14 bg-white border border-gray-200
                                      rounded-2xl shadow-xl py-2 min-w-[240px] z-50">
                        <Link
                          href="/explore"
                          onClick={() => setMenuOpen(false)}
                          className="block px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                          {t("nav.explore")}
                        </Link>
                        <Link
                          href="/bookings"
                          onClick={() => setMenuOpen(false)}
                          className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {t("nav.trips")}
                        </Link>
                        <Link
                          href="/favorites"
                          onClick={() => setMenuOpen(false)}
                          className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {t("nav.wishlists")}
                        </Link>
                        <Link
                          href="/messages"
                          onClick={() => setMenuOpen(false)}
                          className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {t("nav.messages")}
                        </Link>
                        <div className="border-t border-gray-200 my-2" />
                        <Link
                          href="/support"
                          onClick={() => setMenuOpen(false)}
                          className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {t("nav.support")}
                        </Link>
                        <Link
                          href="/about"
                          onClick={() => setMenuOpen(false)}
                          className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {t("common.about_us")}
                        </Link>
                        <Link
                          href="/careers"
                          onClick={() => setMenuOpen(false)}
                          className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {t("common.careers")}
                        </Link>
                        <Link
                          href="/faq"
                          onClick={() => setMenuOpen(false)}
                          className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {t("common.faq")}
                        </Link>
                        <div className="border-t border-gray-200 my-2" />
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setMenuOpen(false)}
                            className="block px-5 py-3 text-sm font-semibold text-[#166534] hover:bg-emerald-50 transition-colors"
                          >
                            {t("nav.admin_panel")}
                          </Link>
                        )}
                        <Link
                          href="/host/listings"
                          onClick={() => setMenuOpen(false)}
                          className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {t("nav.host_your_home")}
                        </Link>

                        {/* Language toggle in dropdown for mobile */}
                        <div className="border-t border-gray-200 my-2 md:hidden" />
                        <button
                          onClick={() => {
                            toggleLanguage();
                            setMenuOpen(false);
                          }}
                          className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 md:hidden"
                        >
                          <Globe className="w-4 h-4" />
                          {locale === "fr" ? "English" : "Français"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
