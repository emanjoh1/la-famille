"use client";

import { useState } from "react";
import Image from "next/image";
import { Home, DollarSign, CalendarX, Plus, Check, X, ChevronDown, ChevronUp, Pencil } from "lucide-react";
import { updateListingPrice, blockDates, unblockDates, updateBlockedDates } from "@/actions/hostDashboard";

export default function ManagePanel({ listings, blockedDates }: { listings: any[]; blockedDates: any[] }) {
  if (listings.length === 0) {
    return (
      <div className="border border-dashed border-[#DDDDDD] rounded-2xl p-10 text-center">
        <p className="text-[#717171] text-sm">No listings yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {listings.map((listing) => (
        <ListingManageCard
          key={listing.id}
          listing={listing}
          blocked={blockedDates.filter((bd) => bd.listing_id === listing.id)}
        />
      ))}
    </div>
  );
}

function ListingManageCard({ listing, blocked }: { listing: any; blocked: any[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-[#DDDDDD] rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 p-5 hover:bg-[#F7F7F7] transition-colors text-left"
      >
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
          {listing.images?.[0] ? (
            <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" sizes="64px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#222222] truncate">{listing.title}</p>
          <p className="text-sm text-[#717171] truncate">{listing.location}</p>
          <p className="text-sm font-medium text-[#222222] mt-0.5">
            {Number(listing.price_per_night).toLocaleString()} XAF / night
          </p>
        </div>
        <ListingStatusBadge status={listing.status} />
        {open ? <ChevronUp className="w-5 h-5 text-[#717171] flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-[#717171] flex-shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-[#DDDDDD] p-5 grid sm:grid-cols-2 gap-8">
          <PriceEditor listing={listing} />
          <CalendarBlocker listingId={listing.id} blocked={blocked} />
        </div>
      )}
    </div>
  );
}

function PriceEditor({ listing }: { listing: any }) {
  const [price, setPrice] = useState(String(listing.price_per_night));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateListingPrice(listing.id, Number(price));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const dirty = Number(price) !== Number(listing.price_per_night);

  return (
    <div>
      <p className="text-xs font-semibold text-[#717171] uppercase tracking-wide mb-3 flex items-center gap-1">
        <DollarSign className="w-3.5 h-3.5" /> Price per night
      </p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#717171] font-medium">XAF</span>
          <input
            type="number"
            value={price}
            onChange={(e) => { setPrice(e.target.value); setSaved(false); }}
            min={1000}
            className="w-full pl-12 pr-4 py-2.5 border border-[#DDDDDD] rounded-xl text-[#222222] font-semibold focus:outline-none focus:border-[#222222] text-sm"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5
            ${saved
              ? "bg-green-100 text-green-700"
              : dirty
              ? "bg-[#222222] text-white hover:bg-[#333]"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
        >
          {saved ? <><Check className="w-4 h-4" /> Saved</> : saving ? "Saving…" : "Save"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}

function CalendarBlocker({ listingId, blocked }: { listingId: string; blocked: any[] }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localBlocked, setLocalBlocked] = useState(blocked);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editReason, setEditReason] = useState("");
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleBlock = async () => {
    if (!start || !end) return;
    setAdding(true);
    setError(null);
    try {
      await blockDates(listingId, start, end, reason || undefined);
      setLocalBlocked((prev) => [
        ...prev,
        { id: crypto.randomUUID(), listing_id: listingId, start_date: start, end_date: end, reason: reason || null },
      ]);
      setStart(""); setEnd(""); setReason(""); setShowForm(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (bd: any) => {
    setEditingId(bd.id);
    setEditStart(bd.start_date);
    setEditEnd(bd.end_date);
    setEditReason(bd.reason || "");
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setError(null);
  };

  const handleUpdate = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      await updateBlockedDates(id, editStart, editEnd, editReason || undefined);
      setLocalBlocked((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, start_date: editStart, end_date: editEnd, reason: editReason || null } : b
        )
      );
      setEditingId(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      await unblockDates(id);
      setLocalBlocked((prev) => prev.filter((b) => b.id !== id));
      if (editingId === id) setEditingId(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-[#717171] uppercase tracking-wide flex items-center gap-1">
          <CalendarX className="w-3.5 h-3.5" /> Blocked Periods
        </p>
        <button
          onClick={() => { setShowForm((s) => !s); setError(null); }}
          className="flex items-center gap-1 text-xs font-medium text-[#166534] hover:underline"
        >
          <Plus className="w-3.5 h-3.5" /> Block dates
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-[#F7F7F7] rounded-xl p-4 mb-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-[#717171] mb-1 block">From</label>
              <input type="date" value={start} min={today} onChange={(e) => setStart(e.target.value)}
                className="w-full px-3 py-2 border border-[#DDDDDD] rounded-lg text-sm focus:outline-none focus:border-[#222222]" />
            </div>
            <div>
              <label className="text-xs text-[#717171] mb-1 block">To</label>
              <input type="date" value={end} min={start || today} onChange={(e) => setEnd(e.target.value)}
                className="w-full px-3 py-2 border border-[#DDDDDD] rounded-lg text-sm focus:outline-none focus:border-[#222222]" />
            </div>
          </div>
          <input type="text" value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional, e.g. Renovation)"
            className="w-full px-3 py-2 border border-[#DDDDDD] rounded-lg text-sm focus:outline-none focus:border-[#222222]" />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button onClick={() => { setShowForm(false); setError(null); }}
              className="flex-1 py-2 border border-[#DDDDDD] rounded-lg text-sm text-[#717171] hover:bg-white">
              Cancel
            </button>
            <button onClick={handleBlock} disabled={adding || !start || !end}
              className="flex-1 py-2 bg-[#222222] text-white rounded-lg text-sm font-medium hover:bg-[#333] disabled:opacity-50">
              {adding ? "Blocking…" : "Confirm"}
            </button>
          </div>
        </div>
      )}

      {localBlocked.length === 0 ? (
        <p className="text-xs text-[#717171]">No blocked periods.</p>
      ) : (
        <div className="space-y-2">
          {localBlocked.map((bd) =>
            editingId === bd.id ? (
              /* Edit form inline */
              <div key={bd.id} className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-[#717171] mb-1 block">From</label>
                    <input type="date" value={editStart} min={today} onChange={(e) => setEditStart(e.target.value)}
                      className="w-full px-3 py-2 border border-[#DDDDDD] rounded-lg text-sm focus:outline-none focus:border-[#222222] bg-white" />
                  </div>
                  <div>
                    <label className="text-xs text-[#717171] mb-1 block">To</label>
                    <input type="date" value={editEnd} min={editStart || today} onChange={(e) => setEditEnd(e.target.value)}
                      className="w-full px-3 py-2 border border-[#DDDDDD] rounded-lg text-sm focus:outline-none focus:border-[#222222] bg-white" />
                  </div>
                </div>
                <input type="text" value={editReason} onChange={(e) => setEditReason(e.target.value)}
                  placeholder="Reason (optional)"
                  className="w-full px-3 py-2 border border-[#DDDDDD] rounded-lg text-sm focus:outline-none focus:border-[#222222] bg-white" />
                {error && <p className="text-xs text-red-600">{error}</p>}
                <div className="flex gap-2">
                  <button onClick={() => handleUnblock(bd.id)}
                    className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50">
                    Delete
                  </button>
                  <button onClick={cancelEdit}
                    className="flex-1 py-1.5 border border-[#DDDDDD] rounded-lg text-xs text-[#717171] hover:bg-white">
                    Cancel
                  </button>
                  <button onClick={() => handleUpdate(bd.id)} disabled={saving || !editStart || !editEnd}
                    className="flex-1 py-1.5 bg-[#222222] text-white rounded-lg text-xs font-medium hover:bg-[#333] disabled:opacity-50 flex items-center justify-center gap-1">
                    {saving ? "Saving…" : <><Check className="w-3 h-3" /> Save</>}
                  </button>
                </div>
              </div>
            ) : (
              /* Display row */
              <div key={bd.id} className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-red-800">
                    {new Date(bd.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    {" → "}
                    {new Date(bd.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  {bd.reason && <p className="text-xs text-red-600 truncate">{bd.reason}</p>}
                </div>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  <button onClick={() => startEdit(bd)} className="text-amber-500 hover:text-amber-700 p-1" title="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleUnblock(bd.id)} className="text-red-400 hover:text-red-700 p-1" title="Delete">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

function ListingStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved:       "bg-green-100 text-green-800",
    pending_review: "bg-amber-100 text-amber-800",
    rejected:       "bg-red-100 text-red-800",
    snoozed:        "bg-gray-100 text-gray-600",
  };
  const label: Record<string, string> = {
    approved: "Live", pending_review: "Pending", rejected: "Rejected", snoozed: "Snoozed",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {label[status] ?? status}
    </span>
  );
}
