"use client";

import Link from "next/link";
import { Globe, Menu, Search, ArrowLeftRight } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLanguageContext } from "@/lib/i18n/provider";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [mode, setMode] = useState<"guest" | "host">("guest");
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = (user?.publicMetadata?.role as string) === "admin";
  const { locale, setLocale, t } = useLanguageContext();

  // Check if user is a host
  useEffect(() => {
    if (!user) return;
    fetch("/api/host/check")
      .then((r) => r.json())
      .then(({ isHost }) => {
        setIsHost(isHost);
        // Restore saved mode
        const saved = localStorage.getItem("lafamille_mode") as "guest" | "host" | null;
        if (saved && isHost) setMode(saved);
      })
      .catch(() => {});
  }, [user]);

  // Sync mode with current path
  useEffect(() => {
    if (pathname.startsWith("/host")) setMode("host");
  }, [pathname]);

  const switchMode = () => {
    const next = mode === "guest" ? "host" : "guest";
    setMode(next);
    localStorage.setItem("lafamille_mode", next);
    setMenuOpen(false);
    router.push(next === "host" ? "/host/dashboard" : "/explore");
  };

  const toggleLanguage = () => setLocale(locale === "fr" ? "en" : "fr");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    window.location.href = `/explore${params.toString() ? `?${params}` : ""}`;
  };

  const isHostMode = mode === "host";

  return (
    <nav className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200 z-50 shadow-sm" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20 gap-4">

          {/* Left: Logo */}
          <Link href={isHostMode ? "/host/dashboard" : "/explore"} className="flex-shrink-0 flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#166534] to-[#15803D] rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-xl">🏠</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#166534] to-[#15803D] bg-clip-text text-transparent">La Famille</span>
          </Link>

          {/* Center: Search pill — only in guest mode */}
          {!isHostMode && (
            <div className="hidden md:flex items-stretch border border-gray-200 rounded-full
                            shadow-sm hover:shadow-lg transition-all duration-200 divide-x divide-gray-200
                            flex-1 max-w-2xl bg-white">
              <input
                type="text"
                placeholder={t("nav.where_to")}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                aria-label={t("nav.where_to")}
                className="flex-1 px-5 py-3 text-sm text-gray-900 placeholder-gray-400 rounded-l-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#166534] focus-visible:ring-inset"
              />
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                aria-label="Check-in date"
                className="px-5 py-3 text-sm text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#166534] focus-visible:ring-inset"
              />
              <input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
                aria-label="Check-out date"
                className="px-5 py-3 text-sm text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#166534] focus-visible:ring-inset"
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
          )}

          {/* Host mode label */}
          {isHostMode && (
            <div className="hidden md:flex flex-1 items-center justify-center">
              <span className="text-sm font-semibold text-[#166534] bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200">
                Hosting mode
              </span>
            </div>
          )}

          {/* Right */}
          <div className="flex items-center gap-2">
            {!user ? (
              <Link
                href="/auth"
                className="px-6 py-3 bg-gradient-to-r from-[#166534] to-[#15803D] text-white rounded-full text-sm font-semibold
                           hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md"
              >
                {t("common.sign_up")}
              </Link>
            ) : (
              <>
                {/* Switch mode button — desktop */}
                {isHost && (
                  <button
                    onClick={switchMode}
                    className="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 rounded-full hover:bg-gray-100 transition-all duration-200"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    {isHostMode ? "Switch to guest" : "Switch to hosting"}
                  </button>
                )}
                {!isHost && (
                  <Link
                    href="/host/listings"
                    className="hidden md:block px-5 py-2.5 text-sm font-semibold text-gray-700 rounded-full hover:bg-gray-100 transition-all duration-200"
                  >
                    {t("nav.become_host")}
                  </Link>
                )}

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
                    className="flex items-center gap-3 border border-gray-200 rounded-full px-4 py-2 hover:shadow-md transition-all duration-200 bg-white"
                    aria-expanded={menuOpen}
                    aria-haspopup="true"
                    aria-controls="nav-menu"
                    aria-label="Navigation menu"
                  >
                    <Menu className="w-5 h-5 text-gray-700" />
                    <UserButton afterSignOutUrl="/" />
                  </button>

                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <div
                        id="nav-menu"
                        role="menu"
                        className="absolute right-0 top-14 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 min-w-[240px] z-50"
                      >
                        {/* Mode switcher at top */}
                        {isHost && (
                          <>
                            <button
                              onClick={switchMode}
                              className="w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold hover:bg-gray-50 transition-colors"
                            >
                              <span className={`w-2 h-2 rounded-full ${isHostMode ? "bg-[#166534]" : "bg-gray-300"}`} />
                              <span className="flex-1 text-left">
                                {isHostMode ? "Switch to guest mode" : "Switch to hosting"}
                              </span>
                              <ArrowLeftRight className="w-4 h-4 text-gray-400" />
                            </button>
                            <div className="border-t border-gray-200 my-2" />
                          </>
                        )}

                        {isHostMode ? (
                          // Host mode links
                          <>
                            <Link href="/host/dashboard" onClick={() => setMenuOpen(false)}
                              className="block px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                              Dashboard
                            </Link>
                            <Link href="/host/listings" onClick={() => setMenuOpen(false)}
                              className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              My Listings
                            </Link>
                            <Link href="/host/listings/new" onClick={() => setMenuOpen(false)}
                              className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              Add Listing
                            </Link>
                          </>
                        ) : (
                          // Guest mode links
                          <>
                            <Link href="/explore" onClick={() => setMenuOpen(false)}
                              className="block px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                              {t("nav.explore")}
                            </Link>
                            <Link href="/bookings" onClick={() => setMenuOpen(false)}
                              className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              {t("nav.trips")}
                            </Link>
                            <Link href="/favorites" onClick={() => setMenuOpen(false)}
                              className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              {t("nav.wishlists")}
                            </Link>
                            <Link href="/messages" onClick={() => setMenuOpen(false)}
                              className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              {t("nav.messages")}
                            </Link>
                          </>
                        )}

                        <div className="border-t border-gray-200 my-2" />
                        <Link href="/support" onClick={() => setMenuOpen(false)}
                          className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          {t("nav.support")}
                        </Link>
                        <Link href="/about" onClick={() => setMenuOpen(false)}
                          className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          {t("common.about_us")}
                        </Link>
                        <Link href="/faq" onClick={() => setMenuOpen(false)}
                          className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          {t("common.faq")}
                        </Link>

                        {isAdmin && (
                          <>
                            <div className="border-t border-gray-200 my-2" />
                            <Link href="/admin" onClick={() => setMenuOpen(false)}
                              className="block px-5 py-3 text-sm font-semibold text-[#166534] hover:bg-emerald-50 transition-colors">
                              {t("nav.admin_panel")}
                            </Link>
                          </>
                        )}

                        {!isHost && (
                          <>
                            <div className="border-t border-gray-200 my-2" />
                            <Link href="/host/listings" onClick={() => setMenuOpen(false)}
                              className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              {t("nav.host_your_home")}
                            </Link>
                          </>
                        )}

                        <div className="border-t border-gray-200 my-2 md:hidden" />
                        <button
                          onClick={() => { toggleLanguage(); setMenuOpen(false); }}
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
