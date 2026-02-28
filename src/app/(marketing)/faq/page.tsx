import { HelpCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "FAQ | La Famille",
  description: "Frequently asked questions about La Famille property rentals",
};

export default function FAQPage() {
  const faqs = [
    {
      category: "For Guests",
      questions: [
        {
          q: "How do I book a property?",
          a: "Browse listings, select your dates, and click 'Reserve'. You'll complete payment through our secure Stripe checkout. Once confirmed, you'll receive booking details via email.",
        },
        {
          q: "Can I cancel my booking?",
          a: "Yes, you can cancel pending bookings from your Trips page. For confirmed bookings, please contact support for assistance.",
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards, debit cards, and mobile money through our secure Stripe payment gateway.",
        },
        {
          q: "How do I contact my host?",
          a: "Once your booking is confirmed, you can message your host directly through the Messages section in your account.",
        },
      ],
    },
    {
      category: "For Hosts",
      questions: [
        {
          q: "How do I list my property?",
          a: "Click 'Become a host' in the navigation menu, fill out the listing form with details and photos. Our team will review and approve your listing within 24-48 hours.",
        },
        {
          q: "What is the service fee?",
          a: "La Famille charges a 14% service fee on each booking. This covers payment processing, customer support, and platform maintenance.",
        },
        {
          q: "When do I receive payment?",
          a: "Payments are processed 24 hours after guest check-in. You'll receive your earnings minus the 14% service fee directly to your account.",
        },
        {
          q: "Can I edit my listing?",
          a: "Yes, you can edit your listing anytime from the Host Dashboard. Changes to pricing and availability are instant, while other changes may require re-approval.",
        },
      ],
    },
    {
      category: "Safety & Trust",
      questions: [
        {
          q: "How do you verify listings?",
          a: "Every listing is manually reviewed by our team before approval. We check photos, descriptions, and host information to ensure quality and authenticity.",
        },
        {
          q: "Is my payment information secure?",
          a: "Yes, all payments are processed through Stripe, a PCI-compliant payment processor. We never store your full card details.",
        },
        {
          q: "What if there's an issue with my booking?",
          a: "Contact our support team immediately. We're here to help resolve any issues and ensure you have a great experience.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <HelpCircle className="w-8 h-8 text-emerald-700" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-700">
            Find answers to common questions about La Famille
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {faqs.map((section, idx) => (
          <div key={idx} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.category}</h2>
            <div className="space-y-4">
              {section.questions.map((faq, qIdx) => (
                <details key={qIdx} className="group bg-white border border-gray-200 rounded-xl">
                  <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                    {faq.q}
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-gray-700 px-6 pb-6 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 rounded-2xl p-12 text-center text-white mt-16">
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-lg mb-8 opacity-90">
            Our support team is here to help you 24/7
          </p>
          <Link
            href="/support"
            className="inline-block px-8 py-4 bg-white text-emerald-700 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
