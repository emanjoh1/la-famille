import { getHostDetailAdmin } from "@/actions/admin";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, User, Ban, Home, ShieldCheck, ShieldX, ShieldAlert,
  Clock, Calendar, Users, DollarSign, ChevronDown,
} from "lucide-react";
import KYCImageViewer from "../../KYCImageViewer";
import PropertyBookings from "./PropertyBookings";

export default async function HostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { userId } = await auth();
  if (!userId) redirect("/auth");

  const client = await clerkClient();
  const me = await client.users.getUser(userId);
  if ((me.publicMetadata?.role as string) !== "admin") redirect("/explore");

  let host;
  try {
    host = await getHostDetailAdmin(id);
  } catch {
    notFound();
  }

  const joined = new Date(host.createdAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  const kycImages = host.kyc
    ? [
        ...(host.kyc.selfie_url ? [{ url: host.kyc.selfie_url, label: "Selfie" }] : []),
        ...(host.kyc.id_card_front_url ? [{ url: host.kyc.id_card_front_url, label: "ID Front" }] : []),
        ...(host.kyc.id_card_back_url ? [{ url: host.kyc.id_card_back_url, label: "ID Back" }] : []),
      ]
    : [];

  const totalBookings = host.listings.reduce((s: number, l: any) => s + l.bookings.length, 0);
  const totalRevenue = host.listings.reduce(
    (s: number, l: any) =>
      s + l.bookings.filter((b: any) => b.status === "confirmed").reduce((ss: number, b: any) => ss + Number(b.total_price), 0),
    0
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link href="/admin/hosts" className="flex items-center gap-2 text-[#717171] hover:text-[#222222] mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Hosts
      </Link>

      {/* Host header */}
      <div className="flex items-center gap-5 mb-8">
        {host.imageUrl ? (
          <img src={host.imageUrl} alt={host.firstName} className="w-20 h-20 rounded-full object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-semibold text-[#222222]">{host.firstName} {host.lastName}</h1>
            {host.banned && (
              <span className="flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded-full">
                <Ban className="w-3 h-3" /> Banned
              </span>
            )}
            <KYCBadge kyc={host.kyc} />
          </div>
          <p className="text-[#717171] text-sm">{host.email}</p>
          <p className="text-[#717171] text-xs mt-0.5">Joined {joined}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <StatCard icon={<Home className="w-5 h-5" />} label="Properties" value={host.listings.length} color="bg-purple-50 text-purple-600" />
        <StatCard icon={<Calendar className="w-5 h-5" />} label="Total Bookings" value={totalBookings} color="bg-blue-50 text-blue-600" />
        <StatCard icon={<DollarSign className="w-5 h-5" />} label="Confirmed Revenue" value={`${totalRevenue.toLocaleString()} XAF`} color="bg-green-50 text-green-600" />
      </div>

      {/* KYC */}
      <section className="border border-[#DDDDDD] rounded-2xl p-6 mb-8">
        <h2 className="text-base font-semibold text-[#222222] mb-4">KYC / Identity</h2>
        {!host.kyc ? (
          <p className="text-sm text-[#717171]">No KYC submission yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2 text-sm">
              <Row label="Full name"      value={host.kyc.full_name} />
              <Row label="Date of birth"  value={host.kyc.date_of_birth} />
              <Row label="Phone"          value={host.kyc.phone_number} />
              <Row label="Address"        value={host.kyc.address} />
              <Row label="City / Country" value={`${host.kyc.city}, ${host.kyc.country}`} />
              <Row
                label="Submitted"
                value={new Date(host.kyc.submitted_at).toLocaleDateString("en-GB", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              />
              {host.kyc.reviewed_at && (
                <Row
                  label="Reviewed"
                  value={new Date(host.kyc.reviewed_at).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                />
              )}
              {host.kyc.rejection_reason && (
                <p className="text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-1">
                  <span className="font-medium">Rejection reason:</span> {host.kyc.rejection_reason}
                </p>
              )}
            </div>
            {kycImages.length > 0 && (
              <div>
                <p className="text-xs text-[#717171] uppercase tracking-wide font-semibold mb-2">Documents</p>
                <KYCImageViewer images={kycImages} />
              </div>
            )}
          </div>
        )}
      </section>

      {/* Properties + bookings */}
      <section>
        <h2 className="text-base font-semibold text-[#222222] mb-4">
          Properties ({host.listings.length})
        </h2>
        {host.listings.length === 0 ? (
          <p className="text-sm text-[#717171]">No listings yet.</p>
        ) : (
          <div className="space-y-6">
            {host.listings.map((listing: any) => (
              <PropertyBookings key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="border border-[#DDDDDD] rounded-2xl p-5">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-xl font-bold text-[#222222]">{value}</p>
      <p className="text-sm text-[#717171]">{label}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-[#717171] w-36 flex-shrink-0">{label}</span>
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
