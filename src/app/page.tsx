import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/explore");
  }

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 w-full bg-white border-b z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-rose-500">La Famille</h1>
          <Link
            href="/auth"
            className="px-6 py-2 border border-gray-300 rounded-full hover:shadow-md transition"
          >
            Sign In
          </Link>
        </div>
      </nav>

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-semibold mb-6 leading-tight">
              Find your perfect stay in Cameroon
            </h2>
            <p className="text-xl text-gray-600">
              Discover unique homes in Douala, Yaoundé, and beyond
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-full shadow-xl p-2 flex items-center gap-2">
            <input
              type="text"
              placeholder="Where are you going?"
              className="flex-1 px-6 py-3 rounded-full focus:outline-none"
            />
            <Link
              href="/explore"
              className="px-8 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition font-medium"
            >
              Search
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
