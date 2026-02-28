import { getUserListings } from "@/actions/listings";
import { HostListingsContent } from "@/components/host/HostListingsContent";

export const metadata = {
  title: "Your Listings | La Famille",
  description: "Manage your property listings on La Famille",
};

export default async function HostListingsPage() {
  const listings = await getUserListings();

  return <HostListingsContent listings={listings} />;
}
