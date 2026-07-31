"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { patientService } from "../../../../services/patient.service";
import { prescriptionsService } from "../../../../services/prescriptions.service";
import type { PatientOption } from "../../../../services/prescriptions.service";
import { Spinner } from "../../../../components/Spinner";

interface ItemForm {
  name: string;
  dosage: string;
  quantity: string;
  instructions: string;
}

const EMPTY_ITEM: ItemForm = { name: "", dosage: "", quantity: "", instructions: "" };

const inputClass =
  "mt-1 h-10 w-full rounded-md border border-[#1A3A43] bg-black/30 px-3 text-sm text-white outline-none placeholder:text-[#A7B8BD]/70 focus:border-[#00D9FF]";

export default function NewPrescriptionPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [patientId, setPatientId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemForm[]>([EMPTY_ITEM]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    patientService
      .findOptions()
      .then((res) => setPatients(res))
      .catch(() => setError("No se pudieron cargar los pacientes"));
  }, []);

  const updateItem = (index: number, field: keyof ItemForm, value: string) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  };

  const addItem = () => setItems((prev) => [...prev, EMPTY_ITEM]);
  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validItems = items.filter((it) => it.name.trim() !== "");
    if (!patientId) {
      setError("Selecciona un paciente");
      return;
    }
    if (validItems.length === 0) {
      setError("Agrega al menos un medicamento");
      return;
    }

    setSaving(true);
    try {
      const res = await prescriptionsService.create({
        patientId,
        notes: notes.trim() || undefined,
        items: validItems.map((it) => ({
          name: it.name.trim(),
          dosage: it.dosage.trim() || undefined,
          quantity: it.quantity.trim() ? Number(it.quantity) : undefined,
          instructions: it.instructions.trim() || undefined,
        })),
      });
      router.push(`/doctor/prescripciones/${res.prescription.id}`);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "data" in err
          ? String((err as { data: { message: string } }).data?.message ?? "Error")
          : "Error al crear la prescripcion";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/doctor/prescripciones" className="text-sm text-[#00D9FF] hover:underline">
          ← Volver a mis prescripciones
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-white">Nueva prescripcion</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-[#1A3A43] bg-[#11252C]/40 p-6">
          <h2 className="text-lg font-semibold text-white">Paciente</h2>
          <div className="mt-4">
            <label className="text-sm font-medium text-[#A7B8BD]">Selecciona un paciente</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className={inputClass}
              required
            >
              <option value="">Elige un paciente...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.user.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-[#A7B8BD]">Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Indicaciones generales, diagnostico, etc."
              className="mt-1 w-full rounded-md border border-[#1A3A43] bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-[#A7B8BD]/70 focus:border-[#00D9FF]"
            />
          </div>
        </div>

        <div className="rounded-lg border border-[#1A3A43] bg-[#11252C]/40 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Medicamentos</h2>
            <button
              type="button"
              onClick={addItem}
              className="rounded-md border border-[#00D9FF]/40 px-3 py-1.5 text-sm font-medium text-[#00D9FF] hover:bg-[#00D9FF]/10 transition"
            >
              + Agregar medicamento
            </button>
          </div>

          <div className="mt-4 space-y-5">
            {items.map((item, index) => (
              <div key={index} className="rounded-lg border border-[#1A3A43] bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#A7B8BD]">
                    Medicamento {index + 1}
                  </p>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-sm text-red-400 hover:text-red-300 transition"
                    >
                      Quitar
                    </button>
                  )}
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-[#A7B8BD]">Nombre</label>
                    <input
                      value={item.name}
                      onChange={(e) => updateItem(index, "name", e.target.value)}
                      placeholder="Ej: Amoxicilina 500mg"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#A7B8BD]">Dosis</label>
                    <input
                      value={item.dosage}
                      onChange={(e) => updateItem(index, "dosage", e.target.value)}
                      placeholder="Ej: 1 cada 8 horas"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#A7B8BD]">Cantidad</label>
                    <input
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      type="number"
                      min={1}
                      placeholder="Ej: 30"
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-[#A7B8BD]">Instrucciones</label>
                    <input
                      value={item.instructions}
                      onChange={(e) => updateItem(index, "instructions", e.target.value)}
                      placeholder="Ej: Tomar despues de las comidas por 7 dias"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

        <div className="flex justify-end gap-3">
          <Link
            href="/doctor/prescripciones"
            className="rounded-md border border-[#1A3A43] px-4 py-2 text-sm text-[#A7B8BD] hover:text-white transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[#00D9FF] px-5 py-2 text-sm font-semibold text-[#061418] hover:bg-cyan-300 disabled:opacity-50 transition"
          >
            {saving ? "Creando..." : "Crear prescripcion"}
          </button>
        </div>
      </form>

      {saving && <Spinner size={5} />}
    </div>
  );
}
