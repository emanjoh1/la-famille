import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getKYCStatus } from "@/actions/kyc";
import NewListingForm from "@/components/host/NewListingForm";

export default async function NewListingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth");

  const kyc = await getKYCStatus(userId);

  if (!kyc || kyc.status !== "approved") {
    redirect("/host/kyc");
  }

  return <NewListingForm />;
}
