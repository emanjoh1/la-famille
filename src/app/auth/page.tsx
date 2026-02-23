"use client";

import { SignIn, SignUp, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { redirect } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {mode === "sign-in" ? (
          <>
            <SignIn routing="hash" />
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => setMode("sign-up")}
                className="text-blue-600 hover:underline"
              >
                Sign up
              </button>
            </p>
          </>
        ) : (
          <>
            <SignUp routing="hash" />
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <button
                onClick={() => setMode("sign-in")}
                className="text-blue-600 hover:underline"
              >
                Sign in
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
