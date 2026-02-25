"use client";

import Link from "next/link";
import { Globe, Menu, Search } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const { user } = useUser();
  const isAdmin = (user?.publicMetadata?.role as string) === "admin";

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
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF385C] to-[#E31C5F] rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-xl">🏠</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#FF385C] to-[#E31C5F] bg-clip-text text-transparent">La Famille</span>
          </Link>

          {/* Center: Search pill */}
          <div className="hidden md:flex items-stretch border border-gray-200 rounded-full
                          shadow-sm hover:shadow-lg transition-all duration-200 divide-x divide-gray-200
                          flex-1 max-w-2xl bg-white">
            <input
              type="text"
              placeholder="Where to?"
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
              className="px-5 py-3 bg-gradient-to-r from-[#FF385C] to-[#E31C5F] text-white rounded-r-full
                         hover:from-[#E31C5F] hover:to-[#D01243] transition-all duration-200 hover:shadow-md"
              aria-label="Search"
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
                className="px-6 py-3 bg-gradient-to-r from-[#FF385C] to-[#E31C5F] text-white rounded-full text-sm font-semibold
                           hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md"
              >
                Sign Up
              </Link>
            ) : (
              <>
                <Link
                  href="/host/listings"
                  className="hidden md:block px-5 py-2.5 text-sm font-semibold text-gray-700
                             rounded-full hover:bg-gray-100 transition-all duration-200"
                >
                  Become a host
                </Link>
                <button
                  className="p-3 rounded-full hover:bg-gray-100 transition-all duration-200 hidden md:flex items-center justify-center"
                  aria-label="Language"
                >
                  <Globe className="w-5 h-5 text-gray-700" />
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
                          Explore
                        </Link>
                        <Link
                          href="/bookings"
                          onClick={() => setMenuOpen(false)}
                          className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Trips
                        </Link>
                        <Link
                          href="/favorites"
                          onClick={() => setMenuOpen(false)}
                          className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Wishlists
                        </Link>
                        <Link
                          href="/messages"
                          onClick={() => setMenuOpen(false)}
                          className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Messages
                        </Link>
                        <div className="border-t border-gray-200 my-2" />
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setMenuOpen(false)}
                            className="block px-5 py-3 text-sm font-semibold text-[#FF385C] hover:bg-rose-50 transition-colors"
                          >
                            Admin Panel
                          </Link>
                        )}
                        <Link
                          href="/host/listings"
                          onClick={() => setMenuOpen(false)}
                          className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Host your home
                        </Link>
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
