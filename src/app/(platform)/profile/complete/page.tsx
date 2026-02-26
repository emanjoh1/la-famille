import { UserProfile } from "@clerk/nextjs";
import { Camera } from "lucide-react";

export default function CompleteProfilePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-[#1E3A8A]" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Complete Your Profile</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Please add a profile picture to continue. This helps build trust in our community and lets hosts and guests know who they're connecting with.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <UserProfile 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none border-0",
            }
          }}
        />
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-2">Why do we require a profile picture?</h3>
        <ul className="space-y-2 text-gray-700 text-sm">
          <li>✓ Builds trust between hosts and guests</li>
          <li>✓ Helps create a safer community</li>
          <li>✓ Makes communication more personal</li>
          <li>✓ Required for hosting properties</li>
        </ul>
      </div>
    </div>
  );
}
