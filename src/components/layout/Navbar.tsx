"use client";

import Link from "next/link";
import { Globe, Menu, Search } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

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
                          shadow-sm hover:shadow-md transition-shadow cursor-pointer divide-x divide-[#DDDDDD]
                          flex-1 max-w-md">
            <div className="flex-1 px-4 py-2 flex flex-col justify-center rounded-l-full hover:bg-[#F7F7F7] transition-colors">
              <span className="text-xs font-semibold text-[#222222]">Where</span>
              <span className="text-xs text-[#717171]">Anywhere</span>
            </div>
            <div className="px-4 py-2 flex flex-col justify-center hover:bg-[#F7F7F7] transition-colors">
              <span className="text-xs font-semibold text-[#222222]">When</span>
              <span className="text-xs text-[#717171]">Any week</span>
            </div>
            <div className="flex items-center gap-2 pl-4 pr-2 py-1.5 rounded-r-full hover:bg-[#F7F7F7] transition-colors">
              <div>
                <span className="text-xs font-semibold text-[#222222] block">Who</span>
                <span className="text-xs text-[#717171]">Add guests</span>
              </div>
              <Link
                href="/explore"
                className="p-2 bg-[#FF385C] text-white rounded-full hover:bg-[#E31C5F] transition-colors flex-shrink-0"
                aria-label="Search"
              >
                <Search className="w-3 h-3" />
              </Link>
            </div>
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
