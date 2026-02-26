"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, MessageCircle, HelpCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useUser();

  if (!user) return null;

  const navItems = [
    { href: "/explore", icon: Search, label: "Explore" },
    { href: "/favorites", icon: Heart, label: "Favorites" },
    { href: "/bookings", icon: Home, label: "Trips" },
    { href: "/messages", icon: MessageCircle, label: "Messages" },
    { href: "/support", icon: HelpCircle, label: "Support" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-[60] safe-area-bottom shadow-lg">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1.5 px-3 py-2 rounded-xl min-w-[64px] transition-all duration-200 ${
                isActive
                  ? "text-[#1E3A8A] bg-rose-50"
                  : "text-gray-600 active:bg-gray-100"
              }`}
            >
              <Icon className={`w-6 h-6 transition-all duration-200 ${
                isActive ? "fill-[#1E3A8A] scale-110" : ""
              }`} />
              <span className={`text-xs font-semibold transition-colors ${
                isActive ? "text-[#1E3A8A]" : "text-gray-600"
              }`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
