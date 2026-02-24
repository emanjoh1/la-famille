import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import { POPULAR_CITIES } from "@/lib/utils/constants";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/explore");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-[#DDDDDD] z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-[#FF385C]">La Famille</h1>
          <Link
            href="/auth"
            className="px-5 py-2 border border-[#DDDDDD] rounded-full text-sm font-medium
                       text-[#222222] hover:bg-[#F7F7F7] hover:shadow-sm transition-all"
          >
            Sign In
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <div className="relative flex flex-col items-center justify-center min-h-[70vh]
                        bg-gradient-to-b from-rose-50 via-white to-white px-6 pt-28 pb-20">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-5xl md:text-6xl font-semibold text-[#222222] leading-tight mb-4">
              Find your perfect stay<br />in Cameroon
            </h2>
            <p className="text-lg text-[#717171]">
              Discover unique homes in Douala, Yaoundé, and beyond
            </p>
          </div>

          {/* 4-segment search pill */}
          <div className="w-full max-w-3xl bg-white rounded-full shadow-xl border border-[#DDDDDD] flex items-stretch">
            {/* Where */}
            <div className="flex-1 px-6 py-3 hover:bg-[#F7F7F7] rounded-l-full transition-colors cursor-pointer">
              <p className="text-xs font-semibold text-[#222222]">Where</p>
              <input
                type="text"
                placeholder="Search destinations"
                className="w-full text-sm text-[#717171] bg-transparent focus:outline-none placeholder-[#717171]"
              />
            </div>

            <div className="w-px bg-[#DDDDDD] self-stretch my-2" />

            {/* Check in */}
            <div className="px-6 py-3 hover:bg-[#F7F7F7] transition-colors cursor-pointer">
              <p className="text-xs font-semibold text-[#222222]">Check in</p>
              <p className="text-sm text-[#717171]">Add dates</p>
            </div>

            <div className="w-px bg-[#DDDDDD] self-stretch my-2" />

            {/* Check out */}
            <div className="px-6 py-3 hover:bg-[#F7F7F7] transition-colors cursor-pointer">
              <p className="text-xs font-semibold text-[#222222]">Check out</p>
              <p className="text-sm text-[#717171]">Add dates</p>
            </div>

            <div className="w-px bg-[#DDDDDD] self-stretch my-2" />

            {/* Who + Search */}
            <div className="flex items-center gap-3 pl-6 pr-3 py-2 rounded-r-full">
              <div>
                <p className="text-xs font-semibold text-[#222222]">Who</p>
                <p className="text-sm text-[#717171]">Add guests</p>
              </div>
              <Link
                href="/explore"
                className="p-3 bg-[#FF385C] text-white rounded-full hover:bg-[#E31C5F] transition-colors flex-shrink-0"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Popular destinations */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h3 className="text-2xl font-semibold text-[#222222] mb-8">Popular destinations</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {POPULAR_CITIES.slice(0, 8).map((city) => (
              <Link
                key={city.name}
                href="/auth"
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-[#F7F7F7] transition-colors"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-rose-100 to-rose-200 flex-shrink-0 flex items-center justify-center">
                  <span className="text-xl">🏙️</span>
                </div>
                <div>
                  <p className="font-semibold text-[#222222]">{city.name}</p>
                  <p className="text-sm text-[#717171]">Cameroon</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
