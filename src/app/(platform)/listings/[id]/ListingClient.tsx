"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { X } from "lucide-react";
import { useLanguageContext } from "@/lib/i18n/provider";

export function MobileBookingButton({ listing }: { listing: { id: string; price_per_night: number; max_guests: number } }) {
  const [showModal, setShowModal] = useState(false);
  const { t } = useLanguageContext();
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    setShowModal(false);
    triggerRef.current?.focus();
  }, []);

  // Trap focus and handle Escape key
  useEffect(() => {
    if (!showModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
        return;
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Focus the close button when modal opens
    const closeBtn = modalRef.current?.querySelector<HTMLElement>("button");
    closeBtn?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showModal, handleClose]);

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#DDDDDD] px-6 py-4 flex items-center justify-between z-[70] safe-area-bottom">
        <div>
          <span className="font-semibold text-[#222222]">
            {listing.price_per_night.toLocaleString()} XAF
          </span>
          <span className="text-[#595959]"> {t("listing.per_night")}</span>
        </div>
        <button
          ref={triggerRef}
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-[#166534] text-white rounded-xl font-medium hover:bg-[#15803D] transition-colors active:scale-95"
        >
          {t("booking.reserve")}
        </button>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-0 lg:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-modal-title"
          ref={modalRef}
        >
          <div className="bg-white w-full lg:max-w-md lg:rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#DDDDDD] px-6 py-4 flex items-center justify-between">
              <h2 id="booking-modal-title" className="text-lg font-semibold text-[#222222]">{t("booking.reserve")}</h2>
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                aria-label="Close booking modal"
              >
                <X className="w-5 h-5 text-[#222222]" />
              </button>
            </div>
            <div className="p-6">
              <BookingWidget listing={listing} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
