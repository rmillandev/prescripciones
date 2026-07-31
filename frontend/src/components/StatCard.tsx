export function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[#1A3A43] bg-[#11252C]/60 p-6">
      <p className="text-sm text-[#A7B8BD]">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

export function BarRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-[#A7B8BD]">{label}</span>
        <span className="font-medium text-white">
          {value} ({pct}%)
        </span>
      </div>
      <div className="mt-1 h-2 w-full rounded-full bg-[#1A3A43]">
        <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
