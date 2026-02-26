"use client";

import { useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProfileCheck() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !user) return;

    if (pathname.startsWith("/auth") || pathname === "/profile/complete") return;

    if (!user.imageUrl || !user.hasImage) {
      router.push("/profile/complete");
    }
  }, [user, isLoaded, pathname, router]);

  return null;
}
