import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getHostDashboardData } from "@/actions/hostDashboard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import HostDashboardClient from "./HostDashboardClient";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata = { title: "Host Dashboard | La Famille" };

export default async function HostDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth");

  // Check if this user has any listings or KYC — i.e. is actually a host
  const [listingsRes, kycRes] = await Promise.all([
    supabaseAdmin.from("listings").select("id").eq("user_id", userId).limit(1),
    supabaseAdmin.from("host_kyc").select("id").eq("user_id", userId).limit(1),
  ]);

  const isHost = (listingsRes.data?.length ?? 0) > 0 || (kycRes.data?.length ?? 0) > 0;

  if (!isHost) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <p className="text-4xl mb-4">🏠</p>
        <h1 className="text-2xl font-semibold text-[#222222] mb-3">You don&apos;t have a host account yet</h1>
        <p className="text-[#717171] mb-8">Create your first listing to start hosting on La Famille.</p>
        <Link
          href="/host/listings/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#166534] text-white rounded-xl font-medium hover:bg-[#15803D] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create a listing
        </Link>
      </div>
    );
  }

  const data = await getHostDashboardData();

  return <HostDashboardClient data={data} />;
}
