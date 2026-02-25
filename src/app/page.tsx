import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Search, Home, Shield, Heart, Star, MapPin, Users, Sparkles } from "lucide-react";
import { POPULAR_CITIES } from "@/lib/utils/constants";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/explore");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF385C] to-[#E31C5F] rounded-xl flex items-center justify-center shadow-md">
              <Home className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#FF385C] to-[#E31C5F] bg-clip-text text-transparent">
              La Famille
            </h1>
          </div>
          <Link
            href="/auth"
            className="px-6 py-3 bg-gradient-to-r from-[#FF385C] to-[#E31C5F] text-white rounded-full text-sm font-bold
                       hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 opacity-70" />
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255, 56, 92, 0.15) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(255, 165, 0, 0.15) 0%, transparent 50%)`
          }} />

          <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full border border-gray-200 mb-6 shadow-sm">
                <Sparkles className="w-4 h-4 text-[#FF385C]" />
                <span className="text-sm font-semibold text-gray-900">Welcome to La Famille</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
                Your Home Away<br />From <span className="bg-gradient-to-r from-[#FF385C] to-[#E31C5F] bg-clip-text text-transparent">Home</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Discover unique stays across Cameroon. From cozy apartments to luxury villas.
              </p>
            </div>

            {/* Enhanced Search Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-2">
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1 px-5 py-3 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-[#FF385C]" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-900 mb-1">Where</p>
                        <input
                          type="text"
                          placeholder="Search destinations"
                          className="w-full text-sm text-gray-600 placeholder-gray-400 bg-transparent focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3 hover:bg-gray-50 rounded-xl transition-colors">
                    <p className="text-xs font-bold text-gray-900 mb-1">Check in</p>
                    <p className="text-sm text-gray-500">Add dates</p>
                  </div>

                  <div className="px-5 py-3 hover:bg-gray-50 rounded-xl transition-colors">
                    <p className="text-xs font-bold text-gray-900 mb-1">Check out</p>
                    <p className="text-sm text-gray-500">Add dates</p>
                  </div>

                  <div className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-900 mb-1">Guests</p>
                      <p className="text-sm text-gray-500">Add guests</p>
                    </div>
                    <Link
                      href="/explore"
                      className="p-4 bg-gradient-to-r from-[#FF385C] to-[#E31C5F] text-white rounded-xl
                                 hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md"
                    >
                      <Search className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Verified Listings"
              description="Every property is reviewed and approved by our team"
              color="from-blue-500 to-blue-600"
            />
            <FeatureCard
              icon={<Heart className="w-8 h-8" />}
              title="Local Experience"
              description="Stay with trusted hosts who know Cameroon best"
              color="from-[#FF385C] to-[#E31C5F]"
            />
            <FeatureCard
              icon={<Star className="w-8 h-8" />}
              title="Best Prices"
              description="Competitive rates with no hidden fees"
              color="from-amber-500 to-orange-500"
            />
          </div>
        </section>

        {/* Popular Destinations */}
        <section className="max-w-7xl mx-auto px-6 py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Explore Cameroon</h3>
            <p className="text-lg text-gray-600">Popular destinations waiting for you</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {POPULAR_CITIES.slice(0, 8).map((city, index) => (
              <Link
                key={city.name}
                href="/auth"
                className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200
                           hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="aspect-square bg-gradient-to-br from-rose-100 via-orange-100 to-amber-100 p-6 flex items-center justify-center">
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-300">🏙️</span>
                </div>
                <div className="p-4">
                  <p className="font-bold text-gray-900 mb-1">{city.name}</p>
                  <p className="text-sm text-gray-600">Cameroon</p>
                </div>
                <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full
                               flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                  <MapPin className="w-4 h-4 text-[#FF385C]" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-[#FF385C] to-[#E31C5F] text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 30% 50%, white 0%, transparent 50%),
                               radial-gradient(circle at 70% 50%, white 0%, transparent 50%)`
            }} />
          </div>
          <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
            <Users className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h3 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h3>
            <p className="text-xl mb-8 opacity-90">Join thousands of travelers finding their perfect stay</p>
            <Link
              href="/auth"
              className="inline-block px-8 py-4 bg-white text-[#FF385C] rounded-full font-bold text-lg
                         hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              Sign Up Now
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF385C] to-[#E31C5F] rounded-xl flex items-center justify-center shadow-md">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-gray-900">La Famille</span>
              </div>
              <p className="text-sm text-gray-600">© 2024 La Famille. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="group p-8 bg-white rounded-2xl border border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all duration-300">
      <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-6
                      group-hover:scale-110 transition-transform duration-300 shadow-md`}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      <h4 className="text-xl font-bold text-gray-900 mb-3">{title}</h4>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
