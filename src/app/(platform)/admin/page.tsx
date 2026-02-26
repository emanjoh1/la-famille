import { getAdminAnalytics } from "@/actions/admin";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BarChart3, Users, Home, DollarSign, Calendar } from "lucide-react";

export const metadata = {
  title: "Admin Dashboard | La Famille",
  description: "Platform analytics and management",
};

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = user.publicMetadata?.role as string | undefined;
  if (role !== "admin") redirect("/explore");

  const analytics = await getAdminAnalytics();

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-[#222222] mb-2">Admin Dashboard</h1>
      <p className="text-[#717171] mb-8">Platform overview and management</p>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Total Revenue"
          value={`${analytics.totalRevenue.toLocaleString()} XAF`}
          subtext={`Commission: ${analytics.platformCommission.toLocaleString()} XAF`}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          label="Bookings"
          value={analytics.bookingStats.total.toString()}
          subtext={`${analytics.bookingStats.confirmed} confirmed`}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={<Home className="w-6 h-6" />}
          label="Listings"
          value={analytics.listingStats.total.toString()}
          subtext={`${analytics.listingStats.pending} pending review`}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Users"
          value={analytics.userStats.total.toString()}
          subtext={`${analytics.userStats.hosts} hosts`}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NavCard
          href="/admin/listings"
          icon={<Home className="w-8 h-8" />}
          title="Listings Management"
          description="Review and approve property listings"
          badge={analytics.listingStats.pending > 0 ? analytics.listingStats.pending : undefined}
        />
        <NavCard
          href="/admin/bookings"
          icon={<Calendar className="w-8 h-8" />}
          title="Bookings"
          description="View and manage all bookings"
          badge={analytics.bookingStats.pending > 0 ? analytics.bookingStats.pending : undefined}
        />
        <NavCard
          href="/admin/users"
          icon={<Users className="w-8 h-8" />}
          title="User Management"
          description="Manage users and roles"
        />
        <NavCard
          href="/admin/analytics"
          icon={<BarChart3 className="w-8 h-8" />}
          title="Analytics"
          description="Detailed platform analytics"
        />
        <NavCard
          href="/admin/financial"
          icon={<DollarSign className="w-8 h-8" />}
          title="Financial Reports"
          description="Revenue and commission reports"
        />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  color: string;
}) {
  return (
    <div className="border border-[#DDDDDD] rounded-2xl p-6">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-[#717171] mb-1">{label}</p>
      <p className="text-2xl font-bold text-[#222222] mb-1">{value}</p>
      <p className="text-xs text-[#717171]">{subtext}</p>
    </div>
  );
}

function NavCard({
  href,
  icon,
  title,
  description,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="border border-[#DDDDDD] rounded-2xl p-6 hover:shadow-lg transition-shadow group relative"
    >
      {badge && (
        <span className="absolute top-4 right-4 bg-[#1E3A8A] text-white text-xs font-bold px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
      <div className="text-[#717171] group-hover:text-[#1E3A8A] transition-colors mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[#222222] mb-2">{title}</h3>
      <p className="text-sm text-[#717171]">{description}</p>
    </Link>
  );
}
