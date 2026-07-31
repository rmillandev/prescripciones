"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { prescriptionsService } from "../../../../services/prescriptions.service";
import type { Prescription } from "../../../../types/Prescription";
import { Spinner } from "../../../../components/Spinner";
import { PrescriptionDetail } from "../../../../components/PrescriptionDetail";

export default function PatientPrescriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [consuming, setConsuming] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await prescriptionsService.findOneByPatient(id);
      setPrescription(res);
    } catch {
      setError("No se pudo cargar la prescripcion");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleConsume = async () => {
    if (!confirm("¿Confirmas que ya consumiste esta prescripcion?")) return;
    setActionError("");
    setConsuming(true);
    try {
      await prescriptionsService.consumeByPatient(id);
      await load();
    } catch {
      setActionError("Error al marcar como consumida");
    } finally {
      setConsuming(false);
    }
  };

  if (loading) return <Spinner size={8} />;

  if (error || !prescription) {
    return (
      <div className="space-y-4">
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error ?? "Prescripcion no encontrada"}
        </p>
        <Link href="/patient/prescripciones" className="text-sm text-[#00D9FF] hover:underline">
          ← Volver a mis prescripciones
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PrescriptionDetail
        prescription={prescription}
        backHref="/patient/prescripciones"
        backLabel="Volver a mis prescripciones"
        action={
          prescription.status === "pending"
            ? {
                label: "Marcar como consumida",
                loading: consuming,
                onClick: handleConsume,
              }
            : undefined
        }
      />
      {actionError && (
        <p className="mx-auto max-w-3xl rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {actionError}
        </p>
      )}
    </div>
  );
}
