"use client";

import { useSignIn, useSignUp, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2, Mail, Lock, User } from "lucide-react";

type Mode = "sign-in" | "sign-up" | "verify" | "reset" | "reset-verify";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "facebook" | null>(null);
  const [error, setError] = useState("");

  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (userLoaded && isSignedIn) router.push("/explore");
  }, [userLoaded, isSignedIn, router]);

  if (!userLoaded || isSignedIn) return null;

  const handleOAuth = async (provider: "oauth_google" | "oauth_facebook") => {
    if (!signInLoaded) return;
    setOauthLoading(provider === "oauth_google" ? "google" : "facebook");
    setError("");
    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/explore",
      });
    } catch (e: any) {
      setError(e.errors?.[0]?.message ?? "OAuth failed. Please try again.");
      setOauthLoading(null);
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInLoaded) return;
    setLoading(true); setError("");
    try {
      await signIn.create({ strategy: "reset_password_email_code", identifier: email });
      setMode("reset-verify");
    } catch (e: any) {
      setError(e.errors?.[0]?.longMessage ?? e.errors?.[0]?.message ?? "Could not send reset email.");
    } finally { setLoading(false); }
  };

  const handleResetVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInLoaded) return;
    setLoading(true); setError("");
    try {
      const result = await signIn.attemptFirstFactor({ strategy: "reset_password_email_code", code, password: newPassword });
      if (result.status === "complete") {
        await (window as any).Clerk?.setActive({ session: result.createdSessionId });
        router.push("/explore");
      }
    } catch (e: any) {
      setError(e.errors?.[0]?.longMessage ?? e.errors?.[0]?.message ?? "Reset failed.");
    } finally { setLoading(false); }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInLoaded) return;
    setLoading(true);
    setError("");
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await (window as any).Clerk?.setActive({ session: result.createdSessionId });
        router.push("/explore");
      }
    } catch (e: any) {
      setError(e.errors?.[0]?.longMessage ?? e.errors?.[0]?.message ?? "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpLoaded) return;
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    setError("");
    try {
      await signUp.create({ firstName, lastName, emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setMode("verify");
    } catch (e: any) {
      setError(e.errors?.[0]?.longMessage ?? e.errors?.[0]?.message ?? "Sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpLoaded) return;
    setLoading(true);
    setError("");
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await (window as any).Clerk?.setActive({ session: result.createdSessionId });
        router.push("/explore");
      }
    } catch (e: any) {
      setError(e.errors?.[0]?.longMessage ?? e.errors?.[0]?.message ?? "Invalid code.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-[#DDDDDD] rounded-xl text-[#222222] text-sm placeholder-[#717171] focus:outline-none focus:border-[#222222] transition-colors";

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-gradient-to-br from-[#166534] to-[#15803D] rounded-xl flex items-center justify-center">
            <span className="text-lg">🏠</span>
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-[#166534] to-[#15803D] bg-clip-text text-transparent">
            La Famille
          </span>
        </div>

        {/* Reset password — enter email */}
        {mode === "reset" && (
          <>
            <h1 className="text-2xl font-semibold text-[#222222] mb-1">Reset password</h1>
            <p className="text-sm text-[#717171] mb-6">Enter your email and we'll send you a reset code.</p>
            <form onSubmit={handleResetRequest} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
                <input type="email" placeholder="Email address" value={email}
                  onChange={(e) => setEmail(e.target.value)} required
                  className={`${inputClass} pl-10`} />
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-[#166534] text-white rounded-xl font-semibold text-sm hover:bg-[#15803D] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Send reset code
              </button>
            </form>
            <button onClick={() => { setMode("sign-in"); setError(""); }} className="mt-4 text-xs text-[#717171] hover:text-[#222222] w-full text-center">← Back to sign in</button>
          </>
        )}

        {/* Reset password — enter code + new password */}
        {mode === "reset-verify" && (
          <>
            <h1 className="text-2xl font-semibold text-[#222222] mb-1">Set new password</h1>
            <p className="text-sm text-[#717171] mb-6">Enter the code sent to <span className="font-medium text-[#222222]">{email}</span> and choose a new password.</p>
            <form onSubmit={handleResetVerify} className="space-y-4">
              <input type="text" inputMode="numeric" maxLength={6} value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className={`${inputClass} text-center text-2xl tracking-[0.5em] font-semibold`}
                autoFocus />
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
                <input type={showPassword ? "text" : "password"} placeholder="New password"
                  value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
                  className={`${inputClass} pl-10 pr-10`} />
                <button type="button" onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717171] hover:text-[#222222]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button type="submit" disabled={loading || code.length < 6 || !newPassword}
                className="w-full py-3 bg-[#166534] text-white rounded-xl font-semibold text-sm hover:bg-[#15803D] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Reset password
              </button>
            </form>
            <button onClick={() => { setMode("reset"); setError(""); }} className="mt-4 text-xs text-[#717171] hover:text-[#222222] w-full text-center">← Back</button>
          </>
        )}

        {/* Verify email */}
        {mode === "verify" && (
          <>
            <h1 className="text-2xl font-semibold text-[#222222] mb-1">Check your email</h1>
            <p className="text-sm text-[#717171] mb-6">
              We sent a 6-digit code to <span className="font-medium text-[#222222]">{email}</span>
            </p>
            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className={`${inputClass} text-center text-2xl tracking-[0.5em] font-semibold`}
                autoFocus
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button type="submit" disabled={loading || code.length < 6}
                className="w-full py-3 bg-[#166534] text-white rounded-xl font-semibold text-sm hover:bg-[#15803D] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Verify email
              </button>
            </form>
            <button onClick={() => setMode("sign-up")} className="mt-4 text-xs text-[#717171] hover:text-[#222222] w-full text-center">
              ← Back
            </button>
          </>
        )}

        {/* Sign in / Sign up */}
        {(mode === "sign-in" || mode === "sign-up") && (
          <>
            <h1 className="text-2xl font-semibold text-[#222222] mb-1">
              {mode === "sign-in" ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-sm text-[#717171] mb-6">
              {mode === "sign-in" ? "Sign in to your account" : "Join La Famille today"}
            </p>

            {/* OAuth buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleOAuth("oauth_google")}
                disabled={oauthLoading !== null}
                className="w-full flex items-center justify-center gap-3 py-3 border border-[#DDDDDD] rounded-xl text-sm font-medium text-[#222222] hover:bg-[#F7F7F7] disabled:opacity-60 transition-colors"
              >
                {oauthLoading === "google"
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <GoogleIcon />}
                Continue with Google
              </button>
              <button
                onClick={() => handleOAuth("oauth_facebook")}
                disabled={oauthLoading !== null}
                className="w-full flex items-center justify-center gap-3 py-3 border border-[#DDDDDD] rounded-xl text-sm font-medium text-[#222222] hover:bg-[#F7F7F7] disabled:opacity-60 transition-colors"
              >
                {oauthLoading === "facebook"
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <FacebookIcon />}
                Continue with Facebook
              </button>
            </div>

            <Divider />

            {/* Email form */}
            <form onSubmit={mode === "sign-in" ? handleSignIn : handleSignUp} className="space-y-3 mt-6">
              {mode === "sign-up" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
                    <input type="text" placeholder="First name" value={firstName}
                      onChange={(e) => setFirstName(e.target.value)} required
                      className={`${inputClass} pl-10`} />
                  </div>
                  <input type="text" placeholder="Last name" value={lastName}
                    onChange={(e) => setLastName(e.target.value)} required
                    className={inputClass} />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
                <input type="email" placeholder="Email address" value={email}
                  onChange={(e) => setEmail(e.target.value)} required
                  className={`${inputClass} pl-10`} />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`${inputClass} pl-10 pr-10`}
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717171] hover:text-[#222222]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {mode === "sign-up" && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`${inputClass} pl-10`}
                  />
                </div>
              )}

              {error && <p className="text-xs text-red-600">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-[#166534] text-white rounded-xl font-semibold text-sm hover:bg-[#15803D] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === "sign-in" ? "Sign in" : "Create account"}
              </button>
            </form>

            {mode === "sign-in" && (
              <p className="text-sm text-center mt-3">
                <button onClick={() => { setMode("reset"); setError(""); }}
                  className="text-[#717171] hover:text-[#222222] hover:underline text-xs">
                  Forgot password?
                </button>
              </p>
            )}

            <p className="text-sm text-center text-[#717171] mt-4">
              {mode === "sign-in" ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => { setMode(mode === "sign-in" ? "sign-up" : "sign-in"); setError(""); }}
                className="font-semibold text-[#166534] hover:underline"
              >
                {mode === "sign-in" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-[#DDDDDD]" />
      <span className="text-xs text-[#717171]">or</span>
      <div className="flex-1 h-px bg-[#DDDDDD]" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  );
}
