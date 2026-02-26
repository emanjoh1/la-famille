import { Heart, Shield, Users, Target } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About Us | La Famille",
  description: "Learn about La Famille's mission to connect people with unique stays across Cameroon",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">About La Famille</h1>
          <p className="text-xl text-gray-700 leading-relaxed">
            Connecting travelers with unique stays across Cameroon, one home at a time.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              La Famille was born from a simple idea: everyone deserves to feel at home, no matter where they travel in Cameroon. We started in 2024 with a vision to create a trusted platform that connects hosts with guests seeking authentic experiences.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Today, we're proud to serve thousands of travelers and hosts across Douala, Yaoundé, Bamenda, and beyond, making it easier than ever to find your perfect stay.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To build a community where every traveler finds a home and every host shares their space with confidence and pride.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We believe in the power of hospitality to bring people together, create memorable experiences, and support local communities across Cameroon.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Community First</h3>
            <p className="text-sm text-gray-600">Building trust and connections</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Safety & Trust</h3>
            <p className="text-sm text-gray-600">Verified listings and secure payments</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Local Support</h3>
            <p className="text-sm text-gray-600">Empowering Cameroonian hosts</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Excellence</h3>
            <p className="text-sm text-gray-600">Quality experiences every time</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-lg mb-8 opacity-90">
            Whether you're looking for a place to stay or want to become a host, we're here for you.
          </p>
          <Link
            href="/auth"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
