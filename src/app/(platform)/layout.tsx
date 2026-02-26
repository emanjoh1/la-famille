import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Footer } from "@/components/layout/Footer";
import { PageSkeleton } from "@/components/ui/PageSkeleton";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="pb-20 lg:pb-0 flex-1">
        <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
