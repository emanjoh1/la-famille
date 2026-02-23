import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/explore" className="text-2xl font-bold text-blue-600">
            La Famille
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/explore" className="hover:text-blue-600">
              Explore
            </Link>
            <Link href="/bookings" className="hover:text-blue-600">
              Bookings
            </Link>
            <Link href="/favorites" className="hover:text-blue-600">
              Favorites
            </Link>
            <Link href="/host/listings" className="hover:text-blue-600">
              Host
            </Link>
            <UserButton />
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
