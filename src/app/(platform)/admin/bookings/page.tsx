import { getAllBookingsAdmin } from "@/actions/admin";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";

export const metadata = {
  title: "Bookings Management | Admin",
};

export default async function AdminBookingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = user.publicMetadata?.role as string | undefined;
  if (role !== "admin") redirect("/explore");

  const bookings = await getAllBookingsAdmin();

  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const pending = bookings.filter((b) => b.status === "pending");
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  const totalRevenue = confirmed.reduce((sum, b) => sum + Number(b.total_price), 0);
  const commission = Math.round(totalRevenue * 0.14);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <Link href="/admin" className="flex items-center gap-2 text-[#717171] hover:text-[#222222] mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-3xl font-semibold text-[#222222] mb-2">Bookings Management</h1>
      <p className="text-[#717171] mb-8">View and manage all platform bookings</p>

      <div className="grid grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Bookings" value={bookings.length.toString()} />
        <StatCard label="Confirmed" value={confirmed.length.toString()} color="text-green-600" />
        <StatCard label="Pending" value={pending.length.toString()} color="text-amber-600" />
        <StatCard label="Revenue" value={`${totalRevenue.toLocaleString()} XAF`} color="text-emerald-700" />
      </div>

      <div className="space-y-8">
        <Section title="Confirmed Bookings" bookings={confirmed} />
        <Section title="Pending Payment" bookings={pending} />
        <Section title="Cancelled" bookings={cancelled} />
      </div>
    </div>
  );
}

function StatCard({ label, value, color = "text-[#222222]" }: { label: string; value: string; color?: string }) {
  return (
    <div className="border border-[#DDDDDD] rounded-xl p-4">
      <p className="text-sm text-[#717171] mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function Section({ title, bookings }: { title: string; bookings: any[] }) {
  if (bookings.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#222222] mb-4">{title} ({bookings.length})</h2>
      <div className="space-y-3">
        {bookings.map((booking) => (
          <div key={booking.id} className="border border-[#DDDDDD] rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-[#222222]">{booking.listings?.title || "Listing"}</h3>
                <p className="text-sm text-[#717171]">{booking.listings?.location}</p>
              </div>
              <StatusBadge status={booking.status} />
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-[#717171]">Check-in</p>
                <p className="font-medium">{format(new Date(booking.check_in), "MMM d, yyyy")}</p>
              </div>
              <div>
                <p className="text-[#717171]">Check-out</p>
                <p className="font-medium">{format(new Date(booking.check_out), "MMM d, yyyy")}</p>
              </div>
              <div>
                <p className="text-[#717171]">Guests</p>
                <p className="font-medium">{booking.guests}</p>
              </div>
              <div>
                <p className="text-[#717171]">Total</p>
                <p className="font-medium">{Number(booking.total_price).toLocaleString()} XAF</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: "bg-green-100 text-green-800",
    pending: "bg-amber-100 text-amber-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
