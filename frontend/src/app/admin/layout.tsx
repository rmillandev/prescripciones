"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: "▦" },
  { label: "Usuarios", href: "/admin/users", icon: "👤" },
  { label: "Doctores", href: "/admin/doctors", icon: "⚕" },
  { label: "Pacientes", href: "/admin/patients", icon: "🏥" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("adminSidebarCollapsed");
    if (saved === "true") setSidebarCollapsed(true);
  }, []);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  const toggleCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("adminSidebarCollapsed", String(next));
      return next;
    });
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00D9FF] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 border-r border-[#1A3A43] bg-[#11252C]/95 backdrop-blur transition-all ${
          sidebarCollapsed ? "w-16" : "w-64"
        } ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} ${
          sidebarCollapsed ? "lg:w-16" : "lg:w-64"
        } lg:translate-x-0`}
      >
        <div className="flex h-16 items-center border-b border-[#1A3A43] px-4">
          {sidebarCollapsed ? (
            <span className="mx-auto text-xl font-semibold text-[#00D9FF]">P</span>
          ) : (
            <Link href="/admin" className="text-xl font-semibold text-[#00D9FF]">
              Prescripciones
            </Link>
          )}
          <button
            onClick={toggleCollapse}
            className={`text-[#A7B8BD] hover:text-white transition ${sidebarCollapsed ? "hidden" : "ml-auto"}`}
            title="Colapsar sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          {sidebarCollapsed && (
            <button
              onClick={toggleCollapse}
              className="mx-auto text-[#A7B8BD] hover:text-white transition"
              title="Expandir sidebar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        <nav className="flex flex-col gap-1 p-2">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
            return sidebarCollapsed ? (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                title={item.label}
                className={`flex items-center justify-center rounded-lg p-2.5 text-lg transition ${
                  isActive
                    ? "bg-[#00D9FF]/10 text-[#00D9FF]"
                    : "text-[#A7B8BD] hover:bg-[#1A3A43]/50 hover:text-white"
                }`}
              >
                {item.icon}
              </Link>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-[#00D9FF]/10 text-[#00D9FF]"
                    : "text-[#A7B8BD] hover:bg-[#1A3A43]/50 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-[#1A3A43] p-2">
          {sidebarCollapsed ? (
            <button
              onClick={logout}
              title="Cerrar sesion"
              className="mx-auto flex items-center justify-center rounded-lg p-2 text-lg text-[#A7B8BD] hover:bg-[#1A3A43]/50 hover:text-white transition"
            >
              ⏻
            </button>
          ) : (
            <div className="flex items-center justify-between px-2">
              <div className="text-sm text-[#A7B8BD] truncate">
                <p className="text-white font-medium truncate">{user.name}</p>
                <p className="text-xs text-[#00D9FF]">{user.role}</p>
              </div>
              <button
                onClick={logout}
                className="rounded-lg px-3 py-1.5 text-sm text-[#A7B8BD] hover:bg-[#1A3A43]/50 hover:text-white transition"
              >
                Salir
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className={`flex flex-1 flex-col transition-all ${sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"}`}>
        <header className="flex h-16 items-center gap-4 border-b border-[#1A3A43] bg-[#0A0A0A] px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#A7B8BD] hover:text-white lg:hidden"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1" />
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
