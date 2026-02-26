import { SupportForm } from "@/components/support/SupportForm";
import { MessageCircle, Mail, Phone, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Support | La Famille",
  description: "Get help with your La Famille experience",
};

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">How Can We Help?</h1>
        <p className="text-lg text-gray-600">We're here to assist you with any questions or concerns</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 bg-white border border-gray-200 rounded-2xl text-center hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-[#1E3A8A]" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Email Us</h3>
          <p className="text-sm text-gray-600 mb-3">Get a response within 24 hours</p>
          <a href="mailto:support@lafamille.com" className="text-[#1E3A8A] font-semibold text-sm hover:underline">
            support@lafamille.com
          </a>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-2xl text-center hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Call Us</h3>
          <p className="text-sm text-gray-600 mb-3">Mon-Fri, 9AM-6PM WAT</p>
          <a href="tel:+237123456789" className="text-green-600 font-semibold text-sm hover:underline">
            +237 123 456 789
          </a>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-2xl text-center hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Live Chat</h3>
          <p className="text-sm text-gray-600 mb-3">Chat with our team</p>
          <button className="text-purple-600 font-semibold text-sm hover:underline">
            Start Chat
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
        <p className="text-gray-600 mb-6">Fill out the form below and we'll get back to you as soon as possible</p>
        <SupportForm />
      </div>

      <div className="mt-12 bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <details className="group">
            <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition-shadow">
              How do I cancel a booking?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-gray-600 mt-2 p-4 bg-white rounded-xl">
              You can cancel pending bookings directly from your Trips page. For confirmed bookings, please contact support for assistance.
            </p>
          </details>

          <details className="group">
            <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition-shadow">
              How do I become a host?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-gray-600 mt-2 p-4 bg-white rounded-xl">
              Click "Become a host" in the navigation menu and follow the steps to list your property. Our team will review and approve your listing.
            </p>
          </details>

          <details className="group">
            <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition-shadow">
              When will I receive my payment as a host?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-gray-600 mt-2 p-4 bg-white rounded-xl">
              Payments are processed 24 hours after guest check-in. You'll receive your earnings minus the 14% service fee.
            </p>
          </details>

          <details className="group">
            <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition-shadow">
              What payment methods do you accept?
              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-gray-600 mt-2 p-4 bg-white rounded-xl">
              We accept all major credit cards, debit cards, and mobile money through our secure Stripe payment gateway.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
