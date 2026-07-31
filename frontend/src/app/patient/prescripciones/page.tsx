"use client";

import { useCallback, useEffect, useState } from "react";
import { prescriptionsService } from "../../../services/prescriptions.service";
import type { Prescription, PrescriptionStatus } from "../../../types/Prescription";
import { Pagination } from "../../../components/Pagination";
import { Spinner } from "../../../components/Spinner";
import { PrescriptionTable } from "../../../components/PrescriptionTable";

export default function PatientPrescriptionsPage() {
  const [rows, setRows] = useState<Prescription[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"" | PrescriptionStatus>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await prescriptionsService.findAllByPatient({
        page,
        limit: 10,
        status: status || undefined,
      });
      setRows(res.data);
      setTotal(res.meta.total);
    } catch {
      setError("Error al cargar las prescripciones");
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Mis prescripciones</h1>
        <p className="mt-1 text-sm text-[#A7B8BD]">{total} prescripciones</p>
      </div>

      <div className="flex gap-3">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as "" | PrescriptionStatus);
            setPage(1);
          }}
          className="h-10 rounded-md border border-[#1A3A43] bg-black/30 px-3 text-sm text-white outline-none focus:border-[#00D9FF]"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="consumed">Consumidas</option>
        </select>
      </div>

      {loading ? (
        <Spinner size={6} />
      ) : error ? (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-[#1A3A43] bg-[#11252C]/40 p-8 text-center">
          <p className="text-sm text-[#A7B8BD]">No hay prescripciones.</p>
        </div>
      ) : (
        <>
          <PrescriptionTable rows={rows} detailHref={(id) => `/patient/prescripciones/${id}`} showAuthor />
          <Pagination page={page} total={total} limit={10} onChange={setPage} />
        </>
      )}
    </div>
  );
}
