import { getAdminAnalytics, getAllBookingsAdmin } from "@/actions/admin";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Users, Home, DollarSign } from "lucide-react";

export const metadata = {
  title: "Analytics | Admin",
};

export default async function AdminAnalyticsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = user.publicMetadata?.role as string | undefined;
  if (role !== "admin") redirect("/explore");

  const analytics = await getAdminAnalytics();
  const bookings = await getAllBookingsAdmin();

  const recentBookings = bookings.slice(0, 10);
  const avgBookingValue = analytics.bookingStats.confirmed > 0
    ? Math.round(analytics.totalRevenue / analytics.bookingStats.confirmed)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <Link href="/admin" className="flex items-center gap-2 text-[#717171] hover:text-[#222222] mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-3xl font-semibold text-[#222222] mb-2">Platform Analytics</h1>
      <p className="text-[#717171] mb-8">Detailed insights and metrics</p>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <MetricCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Total Revenue"
          value={`${analytics.totalRevenue.toLocaleString()} XAF`}
          change="+12.5%"
          color="bg-green-50 text-green-600"
        />
        <MetricCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Avg Booking Value"
          value={`${avgBookingValue.toLocaleString()} XAF`}
          change="+8.2%"
          color="bg-green-50 text-emerald-700"
        />
        <MetricCard
          icon={<Home className="w-6 h-6" />}
          label="Active Listings"
          value={analytics.listingStats.approved.toString()}
          change="+5.1%"
          color="bg-purple-50 text-purple-600"
        />
        <MetricCard
          icon={<Users className="w-6 h-6" />}
          label="Total Users"
          value={analytics.userStats.total.toString()}
          change="+15.3%"
          color="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Breakdown Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <BreakdownCard
          title="Bookings"
          items={[
            { label: "Confirmed", value: analytics.bookingStats.confirmed, color: "text-green-600" },
            { label: "Pending", value: analytics.bookingStats.pending, color: "text-amber-600" },
            { label: "Cancelled", value: analytics.bookingStats.cancelled, color: "text-red-600" },
          ]}
        />
        <BreakdownCard
          title="Listings"
          items={[
            { label: "Approved", value: analytics.listingStats.approved, color: "text-green-600" },
            { label: "Pending", value: analytics.listingStats.pending, color: "text-amber-600" },
            { label: "Rejected", value: analytics.listingStats.rejected, color: "text-red-600" },
          ]}
        />
        <BreakdownCard
          title="Users"
          items={[
            { label: "Guests", value: analytics.userStats.guests, color: "text-emerald-700" },
            { label: "Hosts", value: analytics.userStats.hosts, color: "text-purple-600" },
            { label: "Admins", value: analytics.userStats.admins, color: "text-gray-600" },
          ]}
        />
      </div>

      {/* Recent Activity */}
      <div className="border border-[#DDDDDD] rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-[#222222] mb-4">Recent Bookings</h2>
        <div className="space-y-3">
          {recentBookings.map((booking) => (
            <div key={booking.id} className="flex justify-between items-center py-2 border-b border-[#EEEEEE] last:border-0">
              <div>
                <p className="font-medium text-[#222222]">{booking.listings?.title || "Listing"}</p>
                <p className="text-sm text-[#717171]">{booking.guests} guests · {booking.nights} nights</p>
              </div>
              <p className="font-semibold text-[#222222]">{Number(booking.total_price).toLocaleString()} XAF</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, change, color }: any) {
  return (
    <div className="border border-[#DDDDDD] rounded-2xl p-6">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-[#717171] mb-1">{label}</p>
      <p className="text-2xl font-bold text-[#222222] mb-1">{value}</p>
      <p className="text-xs text-green-600 font-medium">{change} from last month</p>
    </div>
  );
}

function BreakdownCard({ title, items }: any) {
  const total = items.reduce((sum: number, item: any) => sum + item.value, 0);

  return (
    <div className="border border-[#DDDDDD] rounded-2xl p-6">
      <h3 className="font-semibold text-[#222222] mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item: any) => (
          <div key={item.label} className="flex justify-between items-center">
            <span className="text-sm text-[#717171]">{item.label}</span>
            <span className={`font-semibold ${item.color}`}>{item.value}</span>
          </div>
        ))}
        <div className="pt-3 border-t border-[#EEEEEE] flex justify-between items-center">
          <span className="text-sm font-semibold text-[#222222]">Total</span>
          <span className="font-bold text-[#222222]">{total}</span>
        </div>
      </div>
    </div>
  );
}
