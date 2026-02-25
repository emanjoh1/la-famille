import { getFinancialReport } from "@/actions/admin";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, DollarSign, TrendingUp, Wallet } from "lucide-react";
import { format } from "date-fns";

export const metadata = {
  title: "Financial Reports | Admin",
};

export default async function AdminFinancialPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = user.publicMetadata?.role as string | undefined;
  if (role !== "admin") redirect("/explore");

  const report = await getFinancialReport();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <Link href="/admin" className="flex items-center gap-2 text-[#717171] hover:text-[#222222] mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-3xl font-semibold text-[#222222] mb-2">Financial Reports</h1>
      <p className="text-[#717171] mb-8">Revenue and commission breakdown</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <SummaryCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Total Revenue"
          value={`${report.summary.totalRevenue.toLocaleString()} XAF`}
          color="bg-green-50 text-green-600"
        />
        <SummaryCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Platform Commission (14%)"
          value={`${report.summary.platformCommission.toLocaleString()} XAF`}
          color="bg-blue-50 text-blue-600"
        />
        <SummaryCard
          icon={<Wallet className="w-6 h-6" />}
          label="Host Payouts"
          value={`${report.summary.hostPayouts.toLocaleString()} XAF`}
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Transactions Table */}
      <div className="border border-[#DDDDDD] rounded-2xl overflow-hidden">
        <div className="bg-[#F7F7F7] px-6 py-4 border-b border-[#DDDDDD]">
          <h2 className="font-semibold text-[#222222]">All Transactions ({report.summary.bookingCount})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F7F7F7] border-b border-[#DDDDDD]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#717171] uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#717171] uppercase">Property</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#717171] uppercase">Nights</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#717171] uppercase">Total</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#717171] uppercase">Commission</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#717171] uppercase">Host Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEEEEE]">
              {report.bookings.map((booking: any) => {
                const total = Number(booking.total_price);
                const commission = Math.round(total * 0.14);
                const payout = total - commission;

                return (
                  <tr key={booking.id} className="hover:bg-[#F7F7F7]">
                    <td className="px-6 py-4 text-sm text-[#717171]">
                      {format(new Date(booking.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#222222]">
                      {booking.listings?.title || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#717171]">{booking.nights}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#222222] text-right">
                      {total.toLocaleString()} XAF
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-600 text-right">
                      {commission.toLocaleString()} XAF
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 text-right">
                      {payout.toLocaleString()} XAF
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, color }: any) {
  return (
    <div className="border border-[#DDDDDD] rounded-2xl p-6">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-[#717171] mb-1">{label}</p>
      <p className="text-2xl font-bold text-[#222222]">{value}</p>
    </div>
  );
}
