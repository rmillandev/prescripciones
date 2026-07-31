import { SidebarLayout } from "../../components/SidebarLayout";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/doctor", icon: "▦", exact: true },
  { label: "Prescripciones", href: "/doctor/prescripciones", icon: "💊" },
];

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarLayout
      role="doctor"
      storageKey="doctorSidebarCollapsed"
      navItems={NAV_ITEMS}
      brand="Mi Consultorio"
      brandShort="D"
    >
      {children}
    </SidebarLayout>
  );
}
