"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Home, ShieldCheck, ShieldX, ShieldAlert, Clock, User, Ban, ChevronRight } from "lucide-react";
import KYCImageViewer from "../KYCImageViewer";

export default function HostsSearch({ hosts }: { hosts: any[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return hosts;
    return hosts.filter((h) =>
      `${h.firstName} ${h.lastName} ${h.email} ${h.kyc?.full_name ?? ""} ${h.kyc?.city ?? ""} ${h.kyc?.country ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [query, hosts]);

  return (
    <>
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, city…"
          className="w-full pl-11 pr-4 py-3 border border-[#DDDDDD] rounded-xl text-sm text-[#222222] placeholder-[#717171] focus:outline-none focus:border-[#222222]"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#717171] hover:text-[#222222] text-xs"
          >
            Clear
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-[#717171] text-center py-20">No hosts match &ldquo;{query}&rdquo;.</p>
      ) : (
        <>
          {query && (
            <p className="text-sm text-[#717171] mb-4">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
            </p>
          )}
          <div className="space-y-8">
            {filtered.map((host) => (
              <HostCard key={host.id} host={host} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function HostCard({ host }: { host: any }) {
  const joined = new Date(host.createdAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  const kycImages = host.kyc
    ? [
        ...(host.kyc.selfie_url ? [{ url: host.kyc.selfie_url, label: "Selfie" }] : []),
        ...(host.kyc.id_card_front_url ? [{ url: host.kyc.id_card_front_url, label: "ID Front" }] : []),
        ...(host.kyc.id_card_back_url ? [{ url: host.kyc.id_card_back_url, label: "ID Back" }] : []),
      ]
    : [];

  return (
    <div className="border border-[#DDDDDD] rounded-2xl overflow-hidden">
      <Link href={`/admin/hosts/${host.id}`} className="flex items-center gap-4 p-6 border-b border-[#DDDDDD] hover:bg-[#F7F7F7] transition-colors group">
        {host.imageUrl ? (
          <img src={host.imageUrl} alt={host.firstName} className="w-14 h-14 rounded-full object-cover" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="w-6 h-6 text-gray-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-[#222222] text-lg">{host.firstName} {host.lastName}</p>
            {host.banned && (
              <span className="flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                <Ban className="w-3 h-3" /> Banned
              </span>
            )}
          </div>
          <p className="text-sm text-[#717171] truncate">{host.email}</p>
          <p className="text-xs text-[#717171]">Joined {joined}</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-[#717171]">
          <span className="flex items-center gap-1">
            <Home className="w-4 h-4" />
            {host.listings.length} listing{host.listings.length !== 1 ? "s" : ""}
          </span>
          <KYCBadge kyc={host.kyc} />
          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>

      <div className="p-6 grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-semibold text-[#222222] uppercase tracking-wide mb-4">KYC / Identity</h3>
          {!host.kyc ? (
            <p className="text-sm text-[#717171]">No KYC submission yet.</p>
          ) : (
            <div className="space-y-2 text-sm">
              <Row label="Full name"     value={host.kyc.full_name} />
              <Row label="Date of birth" value={host.kyc.date_of_birth} />
              <Row label="Phone"         value={host.kyc.phone_number} />
              <Row label="Address"       value={host.kyc.address} />
              <Row label="City / Country" value={`${host.kyc.city}, ${host.kyc.country}`} />
              <Row
                label="Submitted"
                value={new Date(host.kyc.submitted_at).toLocaleDateString("en-GB", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              />
              {host.kyc.rejection_reason && (
                <p className="text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-2">
                  <span className="font-medium">Rejection reason:</span> {host.kyc.rejection_reason}
                </p>
              )}
              {kycImages.length > 0 && (
                <div className="pt-2">
                  <KYCImageViewer images={kycImages} />
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#222222] uppercase tracking-wide mb-4">Properties</h3>
          {host.listings.length === 0 ? (
            <p className="text-sm text-[#717171]">No listings yet.</p>
          ) : (
            <div className="space-y-3">
              {host.listings.map((listing: any) => (
                <div key={listing.id} className="flex gap-3 border border-[#DDDDDD] rounded-xl overflow-hidden">
                  <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100">
                    {listing.images?.[0] ? (
                      <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 py-2 pr-3 min-w-0">
                    <p className="font-medium text-[#222222] text-sm truncate">{listing.title}</p>
                    <p className="text-xs text-[#717171] truncate">{listing.location}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <ListingStatusBadge status={listing.status} />
                      <span className="text-xs text-[#717171]">{listing.price_per_night?.toLocaleString()} XAF/night</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-[#717171] w-32 flex-shrink-0">{label}</span>
      <span className="text-[#222222] font-medium">{value}</span>
    </div>
  );
}

function KYCBadge({ kyc }: { kyc: any }) {
  if (!kyc)
    return (
      <span className="flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
        <ShieldAlert className="w-3 h-3" /> No KYC
      </span>
    );
  const map: Record<string, { icon: React.ReactNode; cls: string; label: string }> = {
    pending:  { icon: <Clock className="w-3 h-3" />,       cls: "bg-amber-100 text-amber-800", label: "KYC Pending" },
    approved: { icon: <ShieldCheck className="w-3 h-3" />, cls: "bg-green-100 text-green-800", label: "KYC Approved" },
    rejected: { icon: <ShieldX className="w-3 h-3" />,     cls: "bg-red-100 text-red-800",     label: "KYC Rejected" },
  };
  const s = map[kyc.status] ?? map.pending;
  return (
    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
}

function ListingStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "bg-green-100 text-green-800",
    pending_review: "bg-amber-100 text-amber-800",
    rejected: "bg-red-100 text-red-800",
    snoozed: "bg-gray-100 text-gray-600",
  };
  const label: Record<string, string> = {
    approved: "Approved", pending_review: "Pending", rejected: "Rejected", snoozed: "Snoozed",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {label[status] ?? status}
    </span>
  );
}
