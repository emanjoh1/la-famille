"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, MessageCircle, HelpCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useLanguageContext } from "@/lib/i18n/provider";
import type { TranslationKey } from "@/lib/i18n/provider";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const { t } = useLanguageContext();

  if (!user) return null;

  const navItems: { href: string; icon: typeof Search; labelKey: TranslationKey }[] = [
    { href: "/explore", icon: Search, labelKey: "nav.explore" },
    { href: "/favorites", icon: Heart, labelKey: "nav.favorites" },
    { href: "/bookings", icon: Home, labelKey: "nav.trips" },
    { href: "/messages", icon: MessageCircle, labelKey: "nav.messages" },
    { href: "/support", icon: HelpCircle, labelKey: "nav.support" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-[60] safe-area-bottom shadow-lg">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, icon: Icon, labelKey }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1.5 px-3 py-2 rounded-xl min-w-[64px] transition-all duration-200 ${
                isActive
                  ? "text-[#166534] bg-emerald-50"
                  : "text-gray-600 active:bg-gray-100"
              }`}
            >
              <Icon className={`w-6 h-6 transition-all duration-200 ${
                isActive ? "fill-[#166534] scale-110" : ""
              }`} />
              <span className={`text-xs font-semibold transition-colors ${
                isActive ? "text-[#166534]" : "text-gray-600"
              }`}>{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
