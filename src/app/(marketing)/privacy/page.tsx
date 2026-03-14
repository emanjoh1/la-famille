import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | La Famille",
  description: "How La Famille collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: February 2026</p>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
          <p className="text-gray-600 leading-relaxed">
            We collect information you provide directly to us, including your name, email address, phone number,
            profile photo, and payment information. We also collect information about your use of the Platform,
            including booking history, search queries, and device information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-600 leading-relaxed">
            We use the information we collect to provide and improve our services, process bookings and payments,
            communicate with you about your account and bookings, send you marketing communications (with your
            consent), ensure the safety and security of our Platform, and comply with legal obligations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
          <p className="text-gray-600 leading-relaxed">
            We share your information with Hosts or Guests as needed to facilitate bookings, payment processors
            (Stripe) to complete transactions, service providers who assist in operating our Platform, and law
            enforcement when required by law. We do not sell your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
          <p className="text-gray-600 leading-relaxed">
            We implement appropriate technical and organizational measures to protect your personal information
            against unauthorized access, alteration, disclosure, or destruction. Payment information is processed
            securely through Stripe and is never stored on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
          <p className="text-gray-600 leading-relaxed">
            You have the right to access, correct, or delete your personal information. You can update your profile
            information through your account settings. To request deletion of your account and associated data,
            please contact us at support@lafamille.com.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Cookies</h2>
          <p className="text-gray-600 leading-relaxed">
            We use cookies and similar technologies to improve your experience on our Platform. These include
            essential cookies for authentication and security, functional cookies for your language preference,
            and analytics cookies to understand how the Platform is used.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
          <p className="text-gray-600 leading-relaxed">
            We retain your personal information for as long as your account is active or as needed to provide
            you services. We may retain certain information as required by law or for legitimate business purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Contact</h2>
          <p className="text-gray-600 leading-relaxed">
            For questions about this Privacy Policy or our data practices, please contact us at
            support@lafamille.com.
          </p>
        </section>
      </div>
    </div>
  );
}
