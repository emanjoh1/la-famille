"use client";

import { useLanguageContext } from "@/lib/i18n/provider";
import { SupportForm } from "@/components/support/SupportForm";
import { MessageCircle, Mail, Phone, HelpCircle } from "lucide-react";

export default function SupportPage() {
  const { t } = useLanguageContext();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8 text-emerald-700" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">{t("support.title")}</h1>
        <p className="text-lg text-gray-600">{t("support.subtitle")}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 bg-white border border-gray-200 rounded-2xl text-center hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-[#166534]" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">{t("support.email_us")}</h3>
          <p className="text-sm text-gray-600 mb-3">{t("support.email_response")}</p>
          <a href="mailto:support@lafamille.com" className="text-[#166534] font-semibold text-sm hover:underline">
            support@lafamille.com
          </a>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-2xl text-center hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">{t("support.call_us")}</h3>
          <p className="text-sm text-gray-600 mb-3">{t("support.call_hours")}</p>
          <a href="tel:+237123456789" className="text-green-600 font-semibold text-sm hover:underline">
            +237 123 456 789
          </a>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-2xl text-center hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">{t("support.live_chat")}</h3>
          <p className="text-sm text-gray-600 mb-3">{t("support.chat_team")}</p>
          <button className="text-purple-600 font-semibold text-sm hover:underline">
            {t("support.start_chat")}
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("support.send_message")}</h2>
        <p className="text-gray-600 mb-6">{t("support.form_description")}</p>
        <SupportForm />
      </div>

      <div className="mt-12 bg-gradient-to-r from-green-50 to-orange-50 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{t("support.faq_title")}</h3>
        <div className="space-y-4">
          <details className="group">
            <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition-shadow">
              {t("support.faq_cancel_booking")}
              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-gray-600 mt-2 p-4 bg-white rounded-xl">
              {t("support.faq_cancel_answer")}
            </p>
          </details>

          <details className="group">
            <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition-shadow">
              {t("support.faq_become_host")}
              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-gray-600 mt-2 p-4 bg-white rounded-xl">
              {t("support.faq_become_host_answer")}
            </p>
          </details>

          <details className="group">
            <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition-shadow">
              {t("support.faq_payment_host")}
              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-gray-600 mt-2 p-4 bg-white rounded-xl">
              {t("support.faq_payment_host_answer")}
            </p>
          </details>

          <details className="group">
            <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition-shadow">
              {t("support.faq_payment_methods")}
              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-gray-600 mt-2 p-4 bg-white rounded-xl">
              {t("support.faq_payment_methods_answer")}
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
