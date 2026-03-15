"use client";

import Link from "next/link";
import { Home, Shield, Heart, Star, MapPin, Users } from "lucide-react";
import { POPULAR_CITIES } from "@/lib/utils/constants";
import { SearchBar } from "@/components/home/SearchBar";
import { useDict } from "@/lib/i18n/use-dict";
import { motion, type Variants } from "framer-motion";
import { useState, useEffect } from "react";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const destinationVariant: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const destinationStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

export function HomePageContent({ today }: { today: string }) {
  const { t } = useDict();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <motion.nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-white/97 border-gray-200 shadow-[0_4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md"
            : "bg-white/90 border-transparent shadow-sm backdrop-blur-sm"
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-[#166534] to-[#15803D] rounded-xl flex items-center justify-center shadow-md">
              <Home className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#166534] to-[#15803D] bg-clip-text text-transparent">
              La Famille
            </h1>
          </div>
          <Link
            href="/auth"
            className="px-6 py-3 bg-gradient-to-r from-[#166534] to-[#15803D] text-white rounded-full text-sm font-bold
                       hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md"
          >
            {t("common.sign_up")}
          </Link>
        </div>
      </motion.nav>

      <main>
        {/* Hero Section */}
        <HeroGeometric
          badge="La Famille · Cameroon"
          title1="Find Your Perfect"
          title2="Home Away From Home"
        />

        {/* SearchBar — overlaps bottom of hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="max-w-7xl mx-auto px-6 py-12 -mt-20 relative z-10"
        >
          <SearchBar today={today} />
        </motion.div>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title={t("common.verified")}
              description={t("common.verified_desc")}
              color="from-emerald-600 to-emerald-700"
            />
            <FeatureCard
              icon={<Heart className="w-8 h-8" />}
              title={t("common.local")}
              description={t("common.local_desc")}
              color="from-[#166534] to-[#15803D]"
            />
            <FeatureCard
              icon={<Star className="w-8 h-8" />}
              title={t("common.best_price")}
              description={t("common.best_price_desc")}
              color="from-amber-500 to-orange-500"
            />
          </motion.div>
        </section>

        {/* Popular Destinations */}
        <section className="max-w-7xl mx-auto px-6 py-20 bg-gradient-to-b from-white to-gray-50">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-4xl font-bold text-gray-900 mb-4">{t("common.explore_cameroon")}</h3>
            <p className="text-lg text-gray-600">{t("common.popular_destinations")}</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            variants={destinationStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {POPULAR_CITIES.slice(0, 8).map((city) => (
              <motion.div
                key={city.name}
                variants={destinationVariant}
                whileHover={{
                  scale: 1.03,
                  transition: { type: "spring", stiffness: 300, damping: 20 },
                }}
              >
                <Link
                  href="/auth"
                  className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200
                             hover:shadow-xl transition-shadow duration-300 block"
                >
                  <div className="aspect-square bg-gradient-to-br from-green-100 via-amber-100 to-yellow-100 p-6 flex items-center justify-center">
                    <span className="text-6xl group-hover:scale-110 transition-transform duration-300">🏙️</span>
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-gray-900 mb-1">{city.name}</p>
                    <p className="text-sm text-gray-600">Cameroon</p>
                  </div>
                  <div
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full
                               flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <MapPin className="w-4 h-4 text-[#166534]" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* CTA Section */}
        <motion.section
          className="relative overflow-hidden bg-gradient-to-r from-[#166534] to-[#15803D] text-white"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 30% 50%, white 0%, transparent 50%),
                                 radial-gradient(circle at 70% 50%, white 0%, transparent 50%)`,
              }}
            />
          </div>
          <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
            <Users className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h3 className="text-4xl font-bold mb-4">{t("common.ready_journey")}</h3>
            <p className="text-xl mb-8 opacity-90">{t("common.join_travelers")}</p>
            <Link
              href="/auth"
              className="inline-block px-8 py-4 bg-white text-[#166534] rounded-full font-bold text-lg
                         hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              {t("common.sign_up")}
            </Link>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#166534] to-[#15803D] rounded-xl flex items-center justify-center shadow-md">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-gray-900">La Famille</span>
                </div>
                <p className="text-sm text-gray-600">{t("footer.tagline")}</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-4">{t("footer.company")}</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/about" className="text-gray-600 hover:text-gray-900">{t("common.about_us")}</Link></li>
                  <li><Link href="/careers" className="text-gray-600 hover:text-gray-900">{t("common.careers")}</Link></li>
                  <li><Link href="/support" className="text-gray-600 hover:text-gray-900">{t("common.support")}</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-4">{t("footer.resources")}</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/faq" className="text-gray-600 hover:text-gray-900">{t("common.faq")}</Link></li>
                  <li><Link href="/support" className="text-gray-600 hover:text-gray-900">{t("footer.help_center")}</Link></li>
                  <li><Link href="/auth" className="text-gray-600 hover:text-gray-900">{t("footer.become_host")}</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-4">{t("footer.legal")}</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-600 hover:text-gray-900">{t("footer.terms")}</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-gray-900">{t("footer.privacy")}</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-gray-900">{t("footer.cookie_policy")}</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-600">{t("footer.copyright", { year: "2024" })}</p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-600 hover:text-gray-900">Twitter</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Facebook</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Instagram</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <motion.div
      variants={cardVariant}
      whileHover={{
        y: -4,
        boxShadow: "0 20px 40px rgba(0,0,0,0.10)",
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      className="group p-8 bg-white rounded-2xl border border-gray-200 cursor-default"
    >
      <div
        className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-6
                    group-hover:scale-110 transition-transform duration-300 shadow-md`}
      >
        <div className="text-white">{icon}</div>
      </div>
      <h4 className="text-xl font-bold text-gray-900 mb-3">{title}</h4>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}
