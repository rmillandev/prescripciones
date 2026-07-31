"use client";

import { useEffect, useState } from "react";
import { prescriptionsService } from "../../services/prescriptions.service";
import type { Prescription } from "../../types/Prescription";
import { StatCard } from "../../components/StatCard";
import { Spinner } from "../../components/Spinner";
import { PrescriptionTable } from "../../components/PrescriptionTable";

export default function PatientDashboard() {
  const [recent, setRecent] = useState<Prescription[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [pending, setPending] = useState<number | null>(null);
  const [consumed, setConsumed] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [recentRes, pend, cons] = await Promise.all([
          prescriptionsService.findAllByPatient({ limit: 5 }),
          prescriptionsService.findAllByPatient({ limit: 1, status: "pending" }),
          prescriptionsService.findAllByPatient({ limit: 1, status: "consumed" }),
        ]);
        setRecent(recentRes.data);
        setTotal(recentRes.meta.total);
        setPending(pend.meta.total);
        setConsumed(cons.meta.total);
      } catch {
        setError("Error al cargar tus prescripciones");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Spinner size={8} />;

  if (error) {
    return <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Mis prescripciones</h1>
        <p className="mt-1 text-sm text-[#A7B8BD]">Resumen de tus recetas</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total prescripciones" value={total ?? 0} />
        <StatCard label="Pendientes" value={pending ?? 0} />
        <StatCard label="Consumidas" value={consumed ?? 0} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white">Recientes</h2>
        {recent.length === 0 ? (
          <div className="mt-4 rounded-lg border border-[#1A3A43] bg-[#11252C]/40 p-8 text-center">
            <p className="text-sm text-[#A7B8BD]">Aun no tienes prescripciones.</p>
          </div>
        ) : (
          <div className="mt-4">
            <PrescriptionTable rows={recent} detailHref={(id) => `/patient/prescripciones/${id}`} showAuthor />
          </div>
        )}
      </div>
    </div>
  );
}
