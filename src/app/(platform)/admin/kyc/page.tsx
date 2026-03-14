import { getAllKYCSubmissionsAdmin } from "@/actions/kyc";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, CheckCircle, XCircle, Clock } from "lucide-react";
import KYCAdminActions from "../KYCAdminActions";

export const metadata = { title: "KYC Verification | Admin" };

export default async function AdminKYCPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = user.publicMetadata?.role as string | undefined;
  if (role !== "admin") redirect("/explore");

  const submissions = await getAllKYCSubmissionsAdmin();

  const pending = submissions.filter((s) => s.status === "pending");
  const approved = submissions.filter((s) => s.status === "approved");
  const rejected = submissions.filter((s) => s.status === "rejected");

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link href="/admin" className="flex items-center gap-2 text-[#717171] hover:text-[#222222] mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-3xl font-semibold text-[#222222] mb-2">KYC Verification</h1>
      <p className="text-[#717171] mb-8">Review and verify host identity submissions</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="border border-[#DDDDDD] rounded-2xl p-5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-[#222222]">{pending.length}</p>
          <p className="text-sm text-[#717171]">Pending review</p>
        </div>
        <div className="border border-[#DDDDDD] rounded-2xl p-5">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-3">
            <CheckCircle className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-[#222222]">{approved.length}</p>
          <p className="text-sm text-[#717171]">Approved</p>
        </div>
        <div className="border border-[#DDDDDD] rounded-2xl p-5">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
            <XCircle className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-[#222222]">{rejected.length}</p>
          <p className="text-sm text-[#717171]">Rejected</p>
        </div>
      </div>

      {/* Pending */}
      <Section title="Pending Review" count={pending.length} accent="amber">
        {pending.length === 0 ? (
          <p className="text-[#717171] text-sm py-6 text-center">No pending submissions</p>
        ) : (
          pending.map((sub) => (
            <KYCCard key={sub.id} submission={sub} showActions />
          ))
        )}
      </Section>

      {/* Approved */}
      <Section title="Approved" count={approved.length} accent="green">
        {approved.length === 0 ? (
          <p className="text-[#717171] text-sm py-6 text-center">None yet</p>
        ) : (
          approved.map((sub) => <KYCCard key={sub.id} submission={sub} />)
        )}
      </Section>

      {/* Rejected */}
      <Section title="Rejected" count={rejected.length} accent="red">
        {rejected.length === 0 ? (
          <p className="text-[#717171] text-sm py-6 text-center">None yet</p>
        ) : (
          rejected.map((sub) => <KYCCard key={sub.id} submission={sub} />)
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  count,
  accent,
  children,
}: {
  title: string;
  count: number;
  accent: "amber" | "green" | "red";
  children: React.ReactNode;
}) {
  const colors = {
    amber: "bg-amber-100 text-amber-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
  };
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold text-[#222222]">{title}</h2>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors[accent]}`}>{count}</span>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function KYCCard({
  submission,
  showActions,
}: {
  submission: Record<string, any>;
  showActions?: boolean;
}) {
  const submitted = new Date(submission.submitted_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="border border-[#DDDDDD] rounded-2xl p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Selfie */}
        <div className="flex-shrink-0">
          {submission.selfie_url ? (
            <img
              src={submission.selfie_url}
              alt="Selfie"
              className="w-24 h-24 rounded-xl object-cover border border-[#DDDDDD]"
            />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <p className="font-semibold text-[#222222] text-lg">{submission.full_name}</p>
              <p className="text-sm text-[#717171]">Submitted {submitted}</p>
            </div>
            <StatusBadge status={submission.status} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm mb-4">
            <Info label="Date of Birth" value={submission.date_of_birth} />
            <Info label="Phone" value={submission.phone_number} />
            <Info label="City" value={`${submission.city}, ${submission.country}`} />
            <Info label="Address" value={submission.address} />
          </div>

          {/* ID card thumbnails */}
          <div className="flex gap-3 mb-4">
            {submission.id_card_front_url && (
              <a href={submission.id_card_front_url} target="_blank" rel="noopener noreferrer">
                <img
                  src={submission.id_card_front_url}
                  alt="ID Front"
                  className="h-16 rounded-lg border border-[#DDDDDD] object-cover hover:opacity-80 transition-opacity"
                />
                <p className="text-xs text-[#717171] mt-1 text-center">ID Front</p>
              </a>
            )}
            {submission.id_card_back_url && (
              <a href={submission.id_card_back_url} target="_blank" rel="noopener noreferrer">
                <img
                  src={submission.id_card_back_url}
                  alt="ID Back"
                  className="h-16 rounded-lg border border-[#DDDDDD] object-cover hover:opacity-80 transition-opacity"
                />
                <p className="text-xs text-[#717171] mt-1 text-center">ID Back</p>
              </a>
            )}
          </div>

          {submission.rejection_reason && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
              <span className="font-medium">Rejection reason:</span> {submission.rejection_reason}
            </p>
          )}

          {showActions && <KYCAdminActions kycId={submission.id} />}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[#717171] text-xs">{label}</p>
      <p className="text-[#222222] font-medium truncate">{value}</p>
    </div>
  );
}
