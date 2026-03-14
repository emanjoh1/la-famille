import { getAllHostsAdmin } from "@/actions/admin";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import HostsSearch from "./HostsSearch";

export const metadata = { title: "Hosts | Admin" };

export default async function AdminHostsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth");

  const client = await clerkClient();
  const me = await client.users.getUser(userId);
  if ((me.publicMetadata?.role as string) !== "admin") redirect("/explore");

  const hosts = await getAllHostsAdmin();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <Link href="/admin" className="flex items-center gap-2 text-[#717171] hover:text-[#222222] mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-3xl font-semibold text-[#222222] mb-2">Hosts</h1>
      <p className="text-[#717171] mb-8">
        {hosts.length} registered host{hosts.length !== 1 ? "s" : ""}
      </p>

      {hosts.length === 0 ? (
        <p className="text-[#717171] text-center py-20">No hosts yet.</p>
      ) : (
        <HostsSearch hosts={hosts} />
      )}
    </div>
  );
}
