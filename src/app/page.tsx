import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HomePageContent } from "@/components/home/HomePageContent";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/explore");
  }

  const today = new Date().toISOString().split("T")[0];

  return <HomePageContent today={today} />;
}
