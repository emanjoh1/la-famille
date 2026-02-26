import { Briefcase, MapPin, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Careers | La Famille",
  description: "Join our team and help shape the future of property rentals in Cameroon",
};

export default function CareersPage() {
  const openings = [
    {
      title: "Senior Full Stack Developer",
      location: "Douala, Cameroon",
      type: "Full-time",
      description: "Build and scale our platform using Next.js, TypeScript, and modern web technologies.",
    },
    {
      title: "Customer Success Manager",
      location: "Yaoundé, Cameroon",
      type: "Full-time",
      description: "Help our hosts and guests have amazing experiences on La Famille.",
    },
    {
      title: "Marketing Manager",
      location: "Remote",
      type: "Full-time",
      description: "Drive growth and brand awareness across Cameroon's major cities.",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Join Our Team</h1>
          <p className="text-xl text-gray-700 leading-relaxed">
            Help us build the future of property rentals in Cameroon
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Why Work With Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">🚀 Fast Growth</h3>
              <p className="text-gray-600">Join a rapidly growing startup making real impact in Cameroon</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">💡 Innovation</h3>
              <p className="text-gray-600">Work with cutting-edge technology and modern tools</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">🌍 Impact</h3>
              <p className="text-gray-600">Help shape the future of hospitality in Cameroon</p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Open Positions</h2>
          <div className="space-y-6">
            {openings.map((job, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.type}
                      </span>
                    </div>
                  </div>
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-gray-700 mb-4">{job.description}</p>
                <Link
                  href="/support"
                  className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all"
                >
                  Apply Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Don't See Your Role?</h2>
          <p className="text-lg mb-8 opacity-90">
            We're always looking for talented people. Send us your resume!
          </p>
          <Link
            href="/support"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
