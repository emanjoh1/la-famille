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
    <nav className="sticky top-0 bg-white border-b border-[#DDDDDD] z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20 gap-4">

          {/* Left: Logo */}
          <Link href="/explore" className="flex-shrink-0">
            <span className="text-xl font-bold text-[#FF385C]">La Famille</span>
          </Link>

          {/* Center: Search pill */}
          <div className="hidden md:flex items-stretch border border-[#DDDDDD] rounded-full
                          shadow-sm hover:shadow-md transition-shadow divide-x divide-[#DDDDDD]
                          flex-1 max-w-2xl">
            <input
              type="text"
              placeholder="Where"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 px-4 py-2 text-sm text-[#222222] rounded-l-full focus:outline-none"
            />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="px-4 py-2 text-sm text-[#222222] focus:outline-none"
            />
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="px-4 py-2 text-sm text-[#222222] focus:outline-none"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-[#FF385C] text-white rounded-r-full hover:bg-[#E31C5F] transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Host link + Globe + Hamburger menu */}
          <div className="flex items-center gap-1">
            <Link
              href="/host/listings"
              className="hidden md:block px-4 py-2 text-sm font-medium text-[#222222]
                         rounded-full hover:bg-[#F7F7F7] transition-colors whitespace-nowrap"
            >
              Become a host
            </Link>
            <button
              className="p-2 rounded-full hover:bg-[#F7F7F7] transition-colors hidden md:flex items-center justify-center"
              aria-label="Language"
            >
              <Globe className="w-4 h-4 text-[#222222]" />
            </button>

            {/* Hamburger + Avatar */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 border border-[#DDDDDD] rounded-full
                           px-3 py-2 hover:shadow-md transition-shadow ml-1"
              >
                <Menu className="w-4 h-4 text-[#222222]" />
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
                  <div className="absolute right-0 top-14 bg-white border border-[#DDDDDD]
                                  rounded-xl shadow-lg py-2 min-w-[220px] z-50">
                    <Link
                      href="/explore"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm font-medium text-[#222222] hover:bg-[#F7F7F7]"
                    >
                      Explore
                    </Link>
                    <Link
                      href="/bookings"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7]"
                    >
                      Trips
                    </Link>
                    <Link
                      href="/favorites"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7]"
                    >
                      Wishlists
                    </Link>
                    <Link
                      href="/messages"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7]"
                    >
                      Messages
                    </Link>
                    <div className="border-t border-[#DDDDDD] my-1" />
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm font-semibold text-[#FF385C] hover:bg-[#F7F7F7]"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      href="/host/listings"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7]"
                    >
                      Host your home
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
