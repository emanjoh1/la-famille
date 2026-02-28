"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { useLanguageContext } from "@/lib/i18n/provider";

export function Footer() {
  const { t } = useLanguageContext();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#166534] to-[#15803D] rounded-xl flex items-center justify-center shadow-md">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">La Famille</span>
            </div>
            <p className="text-sm text-gray-600">{t("footer.tagline")}</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-4">{t("footer.company")}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-600 hover:text-gray-900">{t("common.about_us")}</Link></li>
              <li><Link href="/careers" className="text-gray-600 hover:text-gray-900">{t("footer.careers")}</Link></li>
              <li><Link href="/support" className="text-gray-600 hover:text-gray-900">{t("common.support")}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-4">{t("footer.resources")}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/faq" className="text-gray-600 hover:text-gray-900">{t("common.faq")}</Link></li>
              <li><Link href="/support" className="text-gray-600 hover:text-gray-900">{t("footer.help_center")}</Link></li>
              <li><Link href="/host/listings" className="text-gray-600 hover:text-gray-900">{t("footer.become_host")}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-4">{t("footer.legal")}</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-gray-900">{t("footer.terms")}</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">{t("footer.privacy")}</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">{t("footer.cookie_policy")}</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">{t("footer.copyright", { year: new Date().getFullYear() })}</p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-600 hover:text-gray-900">Twitter</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Facebook</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
