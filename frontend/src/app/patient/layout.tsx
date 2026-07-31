import { SidebarLayout } from "../../components/SidebarLayout";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/patient", icon: "▦", exact: true },
  { label: "Mis prescripciones", href: "/patient/prescripciones", icon: "💊" },
];

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarLayout
      role="patient"
      storageKey="patientSidebarCollapsed"
      navItems={NAV_ITEMS}
      brand="Mis Recetas"
      brandShort="R"
    >
      {children}
    </SidebarLayout>
  );
}
