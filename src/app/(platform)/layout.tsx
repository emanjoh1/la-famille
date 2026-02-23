import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 bg-white border-b z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/explore" className="text-2xl font-bold text-rose-500">
            La Famille
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/explore" className="text-gray-700 hover:text-gray-900 font-medium">
              Explore
            </Link>
            <Link href="/bookings" className="text-gray-700 hover:text-gray-900 font-medium">
              Trips
            </Link>
            <Link href="/favorites" className="text-gray-700 hover:text-gray-900 font-medium">
              Wishlists
            </Link>
            <Link href="/host/listings" className="text-gray-700 hover:text-gray-900 font-medium">
              Host
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>
      <main className="pb-16">{children}</main>
    </div>
  );
}
