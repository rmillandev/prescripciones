import Link from "next/link";
import type { Prescription } from "../types/Prescription";
import { StatusBadge } from "./Badge";

export function PrescriptionTable({
  rows,
  detailHref,
  showAuthor = false,
}: {
  rows: Prescription[];
  detailHref: (id: string) => string;
  showAuthor?: boolean;
}) {
  if (rows.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-[#1A3A43]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1A3A43] bg-[#11252C]/40">
            <th className="px-4 py-3 text-left font-medium text-[#A7B8BD]">Codigo</th>
            <th className="px-4 py-3 text-left font-medium text-[#A7B8BD]">Paciente</th>
            {showAuthor && <th className="px-4 py-3 text-left font-medium text-[#A7B8BD]">Doctor</th>}
            <th className="px-4 py-3 text-left font-medium text-[#A7B8BD]">Fecha</th>
            <th className="px-4 py-3 text-left font-medium text-[#A7B8BD]">Estado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} className="border-b border-[#1A3A43] hover:bg-[#11252C]/20">
              <td className="px-4 py-3">
                <Link href={detailHref(p.id)} className="font-mono text-[#00D9FF] hover:underline">
                  {p.code}
                </Link>
              </td>
              <td className="px-4 py-3 font-medium text-white">{p.patient?.user?.name ?? "Paciente"}</td>
              {showAuthor && <td className="px-4 py-3 text-[#A7B8BD]">{p.author?.user?.name ?? "Doctor"}</td>}
              <td className="px-4 py-3 text-[#A7B8BD]">{new Date(p.createdAt).toLocaleString()}</td>
              <td className="px-4 py-3">
                <StatusBadge status={p.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
