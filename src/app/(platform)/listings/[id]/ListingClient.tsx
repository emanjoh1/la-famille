"use client";

import { useState } from "react";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { X } from "lucide-react";

export function MobileBookingButton({ listing }: { listing: any }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#DDDDDD] px-6 py-4 flex items-center justify-between z-[70] safe-area-bottom">
        <div>
          <span className="font-semibold text-[#222222]">
            {listing.price_per_night.toLocaleString()} XAF
          </span>
          <span className="text-[#717171]"> / night</span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-[#1E3A8A] text-white rounded-xl font-medium hover:bg-[#1E40AF] transition-colors active:scale-95"
        >
          Reserve
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-0 lg:p-6">
          <div className="bg-white w-full lg:max-w-md lg:rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#DDDDDD] px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#222222]">Book your stay</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
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
