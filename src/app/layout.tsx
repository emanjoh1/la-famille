import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n/provider";
import { ProfileCheck } from "@/components/auth/ProfileCheck";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "La Famille - Property Rentals in Cameroon",
  description:
    "Find and rent properties across Cameroon - Douala, Yaoundé, and beyond",
  openGraph: {
    title: "La Famille - Property Rentals in Cameroon",
    description:
      "Find and rent unique properties across Cameroon. Apartments, houses, villas, and more.",
    type: "website",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: "#1E3A8A",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "La Famille",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="fr">
        <head>
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        </head>
        <body className={`${inter.variable} antialiased touch-manipulation`}>
          <LanguageProvider>
            <ProfileCheck />
            {children}
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
