export type PrescriptionStatus = "pending" | "consumed";

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  name: string;
  dosage: string | null;
  quantity: number | null;
  instructions: string | null;
}

export interface Prescription {
  id: string;
  code: string;
  status: PrescriptionStatus;
  notes: string | null;
  createdAt: string;
  consumedAt: string | null;
  patientId: string;
  authorId: string;
  patient?: {
    id: string;
    birthDate: string | null;
    userId: string;
    user?: { name: string; email: string } | null;
  } | null;
  author?: {
    id: string;
    specialty: string | null;
    userId: string;
    user?: { name: string; email: string } | null;
  } | null;
  items?: PrescriptionItem[];
}
