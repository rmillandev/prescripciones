import { SidebarLayout } from "../../components/SidebarLayout";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: "▦", exact: true },
  { label: "Usuarios", href: "/admin/users", icon: "👤" },
  { label: "Doctores", href: "/admin/doctors", icon: "⚕" },
  { label: "Pacientes", href: "/admin/patients", icon: "🏥" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarLayout
      role="admin"
      storageKey="adminSidebarCollapsed"
      navItems={NAV_ITEMS}
      brand="Prescripciones"
      brandShort="P"
    >
      {children}
    </SidebarLayout>
  );
}
