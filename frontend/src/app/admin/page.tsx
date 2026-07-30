"use client";

import { useEffect, useState } from "react";
import { adminService } from "../../services/admin.service";
import type { MetricsResponse } from "../../types/Metrics";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await adminService.getMetrics();
        setMetrics(data);
      } catch {
        setError("Error al cargar las metricas");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00D9FF] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>;
  }

  if (!metrics) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-[#A7B8BD]">Resumen del sistema de prescripciones</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Doctores" value={metrics.totals.doctors} />
        <StatCard label="Pacientes" value={metrics.totals.patients} />
        <StatCard label="Prescripciones" value={metrics.totals.prescriptions} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-[#1A3A43] bg-[#11252C]/60 p-6">
          <h2 className="text-lg font-semibold text-white">Por estado</h2>
          <div className="mt-4 space-y-3">
            <BarRow label="Pendientes" value={metrics.byStatus.pending} total={metrics.byStatus.pending + metrics.byStatus.consumed} color="bg-yellow-500" />
            <BarRow label="Consumidas" value={metrics.byStatus.consumed} total={metrics.byStatus.pending + metrics.byStatus.consumed} color="bg-green-500" />
          </div>
        </div>

        <div className="rounded-lg border border-[#1A3A43] bg-[#11252C]/60 p-6">
          <h2 className="text-lg font-semibold text-white">Top doctores</h2>
          {metrics.topDoctors.length === 0 ? (
            <p className="mt-4 text-sm text-[#A7B8BD]">Sin datos</p>
          ) : (
            <div className="mt-4 space-y-3">
              {metrics.topDoctors.map((d, i) => (
                <div key={d.doctorId} className="flex items-center justify-between">
                  <span className="text-sm text-[#A7B8BD]">#{i + 1} Doctor</span>
                  <span className="text-sm font-medium text-white">{d.count} presc.</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {metrics.byDay.length > 0 && (
        <div className="rounded-lg border border-[#1A3A43] bg-[#11252C]/60 p-6">
          <h2 className="text-lg font-semibold text-white">Prescripciones por dia</h2>
          <div className="mt-4 flex items-end gap-1" style={{ height: 120 }}>
            {metrics.byDay.map((day) => {
              const max = Math.max(...metrics.byDay.map((d) => d.count), 1);
              const height = (day.count / max) * 100;
              return (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs text-[#A7B8BD]">{day.count}</span>
                  <div
                    className="w-full rounded-t bg-[#00D9FF]/70 transition-all hover:bg-[#00D9FF]"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-[#A7B8BD]">{day.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[#1A3A43] bg-[#11252C]/60 p-6">
      <p className="text-sm text-[#A7B8BD]">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function BarRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-[#A7B8BD]">{label}</span>
        <span className="text-white font-medium">{value} ({pct}%)</span>
      </div>
      <div className="mt-1 h-2 w-full rounded-full bg-[#1A3A43]">
        <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
