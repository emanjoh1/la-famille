import { getAllListingsAdmin } from "@/actions/listings";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import AdminActions from "./AdminActions";

export default async function AdminPage() {
  // Server-side admin guard
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/auth");
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  if (role !== "admin") redirect("/");

  const listings = await getAllListingsAdmin();

  const pending = listings.filter((l) => l.status === "pending_review");
  const approved = listings.filter((l) => l.status === "approved");
  const rejected = listings.filter((l) => l.status === "rejected");

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-[#222222] mb-2">Admin — Listings</h1>
      <p className="text-[#717171] mb-8">
        Review and approve host submissions before they go live.
      </p>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Pending review", count: pending.length, color: "bg-amber-50 border-amber-200 text-amber-800" },
          { label: "Approved", count: approved.length, color: "bg-green-50 border-green-200 text-green-800" },
          { label: "Rejected", count: rejected.length, color: "bg-red-50 border-red-200 text-red-800" },
        ].map(({ label, count, color }) => (
          <div key={label} className={`border rounded-xl p-4 ${color}`}>
            <p className="text-3xl font-bold">{count}</p>
            <p className="text-sm font-medium mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Pending first */}
      <Section title="⏳ Pending Review" listings={pending} showActions />
      <Section title="✅ Approved" listings={approved} showActions={false} />
      <Section title="❌ Rejected" listings={rejected} showActions={false} />
    </div>
  );
}

function Section({
  title,
  listings,
  showActions,
}: {
  title: string;
  listings: {
    id: string;
    title: string;
    location: string;
    price_per_night: number;
    bedrooms: number;
    bathrooms: number;
    max_guests: number;
    images: string[];
    status: string;
    rejection_reason?: string | null;
    created_at: string;
  }[];
  showActions: boolean;
}) {
  if (listings.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-lg font-semibold text-[#222222] mb-4">{title}</h2>
      <div className="space-y-4">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="border border-[#DDDDDD] rounded-2xl overflow-hidden flex flex-col sm:flex-row"
          >
            {/* Thumbnail */}
            <div className="relative w-full sm:w-44 h-40 sm:h-auto flex-shrink-0 bg-[#F7F7F7]">
              {listing.images[0] ? (
                <Image
                  src={listing.images[0]}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#717171] text-sm">
                  No photo
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 mb-1">
                  <h3 className="font-semibold text-[#222222] text-lg leading-tight">
                    {listing.title}
                  </h3>
                  <StatusBadge status={listing.status} />
                </div>
                <p className="text-sm text-[#717171] mb-3">{listing.location}</p>
                <p className="text-sm text-[#222222]">
                  {listing.bedrooms} bed · {listing.bathrooms} bath · {listing.max_guests} guests ·{" "}
                  <span className="font-medium">
                    {listing.price_per_night.toLocaleString()} XAF / night
                  </span>
                </p>
                {listing.rejection_reason && (
                  <p className="text-sm text-red-600 mt-2">
                    Rejection reason: {listing.rejection_reason}
                  </p>
                )}
              </div>

              {showActions && (
                <div className="mt-4">
                  <AdminActions listingId={listing.id} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending_review: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  const labels: Record<string, string> = {
    pending_review: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  };
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${styles[status] ?? "bg-gray-100 text-gray-700"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
