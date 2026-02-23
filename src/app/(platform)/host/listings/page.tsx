import Link from "next/link";

export default function HostListingsPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <Link
          href="/host/listings/new"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Listing
        </Link>
      </div>
      <p className="text-gray-600">No listings yet.</p>
    </div>
  );
}
