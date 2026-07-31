"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { prescriptionsService } from "../../../../services/prescriptions.service";
import type { Prescription } from "../../../../types/Prescription";
import { Spinner } from "../../../../components/Spinner";
import { PrescriptionDetail } from "../../../../components/PrescriptionDetail";

export default function PrescriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    prescriptionsService
      .findOneByDoctor(id)
      .then((res) => setPrescription(res))
      .catch(() => setError("No se pudo cargar la prescripcion"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner size={8} />;

  if (error || !prescription) {
    return (
      <div className="space-y-4">
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error ?? "Prescripcion no encontrada"}
        </p>
        <Link href="/doctor/prescripciones" className="text-sm text-[#00D9FF] hover:underline">
          ← Volver a mis prescripciones
        </Link>
      </div>
    );
  }

  return (
    <PrescriptionDetail
      prescription={prescription}
      backHref="/doctor/prescripciones"
      backLabel="Volver a mis prescripciones"
    />
  );
}
