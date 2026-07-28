"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

const ROLE_HOME: Record<string, string> = {
  admin: "/admin",
  doctor: "/doctor",
  patient: "/patient",
};

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      router.replace(ROLE_HOME[user.role] ?? "/");
    } else {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex flex-1 items-center justify-center bg-[#0A0A0A]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00D9FF] border-t-transparent" />
    </div>
  );
}
