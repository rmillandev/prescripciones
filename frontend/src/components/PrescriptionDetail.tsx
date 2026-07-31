import Link from "next/link";
import type { Prescription } from "../types/Prescription";
import { StatusBadge } from "./Badge";

export function PrescriptionDetail({
  prescription,
  backHref,
  backLabel,
  action,
}: {
  prescription: Prescription;
  backHref: string;
  backLabel: string;
  action?: {
    label: string;
    loading?: boolean;
    disabled?: boolean;
    onClick: () => void;
  };
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href={backHref} className="text-sm text-[#00D9FF] hover:underline">
          ← {backLabel}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-2xl font-semibold text-white">{prescription.code}</h1>
          <StatusBadge status={prescription.status} />
        </div>
        <p className="mt-1 text-sm text-[#A7B8BD]">
          Creada el {new Date(prescription.createdAt).toLocaleString()}
          {prescription.consumedAt &&
            ` · Consumida el ${new Date(prescription.consumedAt).toLocaleString()}`}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-[#1A3A43] bg-[#11252C]/40 p-6">
          <h2 className="text-sm font-medium text-[#A7B8BD]">Paciente</h2>
          <p className="mt-2 text-lg font-semibold text-white">
            {prescription.patient?.user?.name ?? "Paciente"}
          </p>
        </div>
        <div className="rounded-lg border border-[#1A3A43] bg-[#11252C]/40 p-6">
          <h2 className="text-sm font-medium text-[#A7B8BD]">Doctor</h2>
          <p className="mt-2 text-lg font-semibold text-white">
            {prescription.author?.user?.name ?? "Doctor"}
          </p>
        </div>
      </div>

      {prescription.notes && (
        <div className="rounded-lg border border-[#1A3A43] bg-[#11252C]/40 p-6">
          <h2 className="text-sm font-medium text-[#A7B8BD]">Notas</h2>
          <p className="mt-2 text-sm whitespace-pre-wrap text-white">{prescription.notes}</p>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-[#1A3A43]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1A3A43] bg-[#11252C]/40">
              <th className="px-4 py-3 text-left font-medium text-[#A7B8BD]">Medicamento</th>
              <th className="px-4 py-3 text-left font-medium text-[#A7B8BD]">Dosis</th>
              <th className="px-4 py-3 text-left font-medium text-[#A7B8BD]">Cantidad</th>
              <th className="px-4 py-3 text-left font-medium text-[#A7B8BD]">Instrucciones</th>
            </tr>
          </thead>
          <tbody>
            {prescription.items?.map((item) => (
              <tr key={item.id} className="border-b border-[#1A3A43]">
                <td className="px-4 py-3 font-medium text-white">{item.name}</td>
                <td className="px-4 py-3 text-[#A7B8BD]">{item.dosage ?? "-"}</td>
                <td className="px-4 py-3 text-[#A7B8BD]">{item.quantity ?? "-"}</td>
                <td className="px-4 py-3 text-[#A7B8BD]">{item.instructions ?? "-"}</td>
              </tr>
            ))}
            {(!prescription.items || prescription.items.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-[#A7B8BD]">
                  Sin medicamentos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {action && (
        <div className="flex justify-end">
          <button
            onClick={action.onClick}
            disabled={action.disabled || action.loading}
            className="rounded-md bg-[#00D9FF] px-5 py-2 text-sm font-semibold text-[#061418] hover:bg-cyan-300 disabled:opacity-50 transition"
          >
            {action.loading ? "Guardando..." : action.label}
          </button>
        </div>
      )}
    </div>
  );
}
