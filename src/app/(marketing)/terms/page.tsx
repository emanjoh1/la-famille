import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | La Famille",
  description: "Terms of service for using the La Famille property rental platform.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: February 2026</p>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            By accessing or using La Famille (&ldquo;the Platform&rdquo;), you agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use our services. These terms apply to all users,
            including guests, hosts, and administrators.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
          <p className="text-gray-600 leading-relaxed">
            La Famille is an online platform that connects property owners (&ldquo;Hosts&rdquo;) with travelers
            (&ldquo;Guests&rdquo;) seeking short-term rental accommodations in Cameroon. We facilitate the booking
            process but are not a party to any rental agreement between Hosts and Guests.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
          <p className="text-gray-600 leading-relaxed">
            You must create an account to use certain features of the Platform. You are responsible for maintaining
            the confidentiality of your account credentials and for all activities that occur under your account.
            You must provide accurate and complete information when creating your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Bookings and Payments</h2>
          <p className="text-gray-600 leading-relaxed">
            All bookings are subject to availability and Host approval. Payments are processed securely through
            our payment provider (Stripe) in West African CFA Franc (XAF). A 14% service fee is applied to each
            booking to cover platform costs. Cancellation policies may vary by listing.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Host Responsibilities</h2>
          <p className="text-gray-600 leading-relaxed">
            Hosts are responsible for ensuring their listings are accurate, that properties meet local safety and
            legal requirements, and that they have the right to rent their properties. All listings are subject to
            review and approval by La Famille before being published.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Guest Responsibilities</h2>
          <p className="text-gray-600 leading-relaxed">
            Guests agree to treat rental properties with respect, follow house rules set by Hosts, and leave
            properties in the condition they were found. Guests are liable for any damages caused during their stay.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Prohibited Activities</h2>
          <p className="text-gray-600 leading-relaxed">
            Users may not use the Platform for any illegal purpose, submit false or misleading listings, harass
            other users, attempt to circumvent our payment system, or use the Platform to distribute harmful content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
          <p className="text-gray-600 leading-relaxed">
            La Famille acts as an intermediary and is not responsible for the condition of properties, the actions
            of users, or any disputes between Hosts and Guests. Our liability is limited to the amount of fees
            collected for the relevant booking.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Contact</h2>
          <p className="text-gray-600 leading-relaxed">
            For questions about these Terms of Service, please contact us at support@lafamille.com.
          </p>
        </section>
      </div>
    </div>
  );
}
