import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/explore");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">La Famille</h1>
        <Link
          href="/auth"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Sign In
        </Link>
      </nav>

      <main className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">
          Find Your Perfect Home in Cameroon
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover trusted property rentals across Cameroon. From Douala to Yaoundé, find your ideal accommodation.
        </p>
        <Link
          href="/auth"
          className="inline-block px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700"
        >
          Get Started
        </Link>
      </main>
    </div>
  );
}
