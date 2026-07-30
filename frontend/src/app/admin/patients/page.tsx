"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { patientService } from "@/src/services/patient.service";
import type { Patient } from "@/src/types/Admin";

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await patientService.findAll({ page, limit: 10 });
        setPatients(res.data);
        setTotal(res.meta.total);
      } catch {
        setPatients([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Pacientes</h1>
          <p className="mt-1 text-sm text-[#A7B8BD]">{total} pacientes registrados</p>
        </div>
        <Link href="/admin/users" className="rounded-md bg-[#00D9FF] px-4 py-2 text-sm font-semibold text-[#061418] hover:bg-cyan-300 transition">
          Gestionar usuarios
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00D9FF] border-t-transparent" />
        </div>
      ) : patients.length === 0 ? (
        <p className="text-sm text-[#A7B8BD] py-10 text-center">Sin resultados</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#1A3A43]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1A3A43] bg-[#11252C]/40">
                <th className="px-4 py-3 text-left font-medium text-[#A7B8BD]">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-[#A7B8BD]">Email</th>
                <th className="px-4 py-3 text-left font-medium text-[#A7B8BD]">Fecha nac.</th>
                <th className="px-4 py-3 text-left font-medium text-[#A7B8BD]">Creado</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id} className="border-b border-[#1A3A43] hover:bg-[#11252C]/20">
                  <td className="px-4 py-3 text-white">{p.user.name}</td>
                  <td className="px-4 py-3 text-[#A7B8BD]">{p.user.email}</td>
                  <td className="px-4 py-3 text-[#A7B8BD]">{p.birthDate ? new Date(p.birthDate).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3 text-[#A7B8BD]">{new Date(p.user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} total={total} limit={10} onChange={setPage} />
        </div>
      )}
    </div>
  );
}

function Pagination({ page, total, limit, onChange }: { page: number; total: number; limit: number; onChange: (p: number) => void }) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-[#1A3A43] px-4 py-3">
      <p className="text-sm text-[#A7B8BD]">Página {page} de {pages}</p>
      <div className="flex gap-2">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="rounded-md border border-[#1A3A43] px-3 py-1 text-sm text-[#A7B8BD] hover:text-white disabled:opacity-40 transition">Anterior</button>
        <button disabled={page >= pages} onClick={() => onChange(page + 1)} className="rounded-md border border-[#1A3A43] px-3 py-1 text-sm text-[#A7B8BD] hover:text-white disabled:opacity-40 transition">Siguiente</button>
      </div>
    </div>
  );
}
