const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-500/20 text-purple-300",
  doctor: "bg-blue-500/20 text-blue-300",
  patient: "bg-green-500/20 text-green-300",
};

export function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[role] ?? "bg-zinc-500/20 text-zinc-300"}`}>
      {role}
    </span>
  );
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-300",
  consumed: "bg-green-500/20 text-green-300",
};

export function StatusBadge({ status }: { status: string }) {
  const label = status === "consumed" ? "Consumida" : "Pendiente";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? "bg-zinc-500/20 text-zinc-300"}`}>
      {label}
    </span>
  );
}
