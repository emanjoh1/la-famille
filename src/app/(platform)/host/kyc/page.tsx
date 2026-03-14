import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getKYCStatus } from "@/actions/kyc";
import KYCForm from "@/components/host/KYCForm";

export default async function HostKYCPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth");

  const kycData = await getKYCStatus(userId);

  if (kycData?.status === "approved") {
    redirect("/host/listings");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-green-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Host Verification
            </h1>
            <p className="text-gray-600">
              Complete your KYC verification to start hosting on La Famille
            </p>
          </div>

          {kycData?.status === "pending" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-amber-800 font-medium">
                ⏳ Your verification is under review
              </p>
              <p className="text-amber-700 text-sm mt-1">
                We'll notify you once your application has been reviewed.
              </p>
            </div>
          )}

          {kycData?.status === "rejected" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-medium">
                ❌ Verification Rejected
              </p>
              <p className="text-red-700 text-sm mt-1">
                Reason: {kycData.rejection_reason || "Please resubmit with correct information"}
              </p>
            </div>
          )}

          {(!kycData || kycData.status === "rejected") && <KYCForm />}
        </div>
      </div>
    </div>
  );
}
