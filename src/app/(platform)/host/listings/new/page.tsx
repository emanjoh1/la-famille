import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getKYCStatus } from "@/actions/kyc";
import NewListingForm from "@/components/host/NewListingForm";

export default async function NewListingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth");

  const kyc = await getKYCStatus(userId);

  // Block if no KYC submitted or if rejected (must re-submit)
  if (!kyc || kyc.status === "rejected") {
    redirect("/host/kyc");
  }

  return <NewListingForm kycPending={kyc.status === "pending"} />;
}
