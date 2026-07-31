import { api } from "./api/api";
import { PRESCRIPTIONS_ENDPOINTS } from "./api/endpoints";
import type { PaginatedResponse } from "../types/PaginatedResponse";
import type { Prescription, PrescriptionStatus } from "../types/Prescription";

export interface CreatePrescriptionItemInput {
  name: string;
  dosage?: string;
  quantity?: number;
  instructions?: string;
}

export interface CreatePrescriptionInput {
  patientId: string;
  notes?: string;
  items?: CreatePrescriptionItemInput[];
}

export interface PatientOption {
  id: string;
  user: { name: string };
}

export const prescriptionsService = {
  findAllByDoctor: (params?: {
    page?: number;
    limit?: number;
    status?: PrescriptionStatus;
    from?: string;
    to?: string;
    order?: "asc" | "desc";
  }) =>
    api.get<PaginatedResponse<Prescription>>(PRESCRIPTIONS_ENDPOINTS.byDoctor, {
      params,
    }),

  findOneByDoctor: (id: string) =>
    api.get<Prescription>(`${PRESCRIPTIONS_ENDPOINTS.byDoctor}/${id}`),

  findAllByPatient: (params?: {
    page?: number;
    limit?: number;
    status?: PrescriptionStatus;
    from?: string;
    to?: string;
    order?: "asc" | "desc";
  }) =>
    api.get<PaginatedResponse<Prescription>>(PRESCRIPTIONS_ENDPOINTS.byPatient, {
      params,
    }),

  findOneByPatient: (id: string) =>
    api.get<Prescription>(`${PRESCRIPTIONS_ENDPOINTS.byPatient}/${id}`),

  consumeByPatient: (id: string) =>
    api.patch<{ message: string; status: number; data: { prescriptionId: string; status: PrescriptionStatus; consumedAt: string } }>(
      `${PRESCRIPTIONS_ENDPOINTS.byPatient}/consume/${id}`
    ),

  create: (data: CreatePrescriptionInput) =>
    api.post<{ prescription: Prescription; message: string; status: number }>(
      PRESCRIPTIONS_ENDPOINTS.prescriptions,
      data
    ),
};
