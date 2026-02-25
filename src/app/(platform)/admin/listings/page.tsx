import { getAllListingsAdmin } from "@/actions/listings";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import AdminActions from "../AdminActions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Listings Management | Admin",
};

export default async function AdminListingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = user.publicMetadata?.role as string | undefined;
  if (role !== "admin") redirect("/explore");

  const listings = await getAllListingsAdmin();

  const pending = listings.filter((l) => l.status === "pending_review");
  const approved = listings.filter((l) => l.status === "approved");
  const rejected = listings.filter((l) => l.status === "rejected");

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link href="/admin" className="flex items-center gap-2 text-[#717171] hover:text-[#222222] mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-3xl font-semibold text-[#222222] mb-2">Listings Management</h1>
      <p className="text-[#717171] mb-8">Review and approve host submissions</p>

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
  listings: any[];
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
            <div className="relative w-full sm:w-44 h-40 sm:h-44 flex-shrink-0 bg-[#F7F7F7] flex items-center justify-center overflow-hidden">
              {listing.images[0] ? (
                <Image
                  src={listing.images[0]}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  sizes="176px"
                />
              ) : (
                <span className="text-[#717171] text-sm">No photo</span>
              )}
            </div>

            <div className="flex-1 p-5 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-[#222222] text-lg">{listing.title}</h3>
                <p className="text-sm text-[#717171] mb-2">{listing.location}</p>
                <p className="text-sm text-[#222222]">
                  {listing.bedrooms} bed · {listing.bathrooms} bath · {listing.max_guests} guests ·{" "}
                  <span className="font-medium">{listing.price_per_night.toLocaleString()} XAF / night</span>
                </p>
                {listing.rejection_reason && (
                  <p className="text-sm text-red-600 mt-2">Reason: {listing.rejection_reason}</p>
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
