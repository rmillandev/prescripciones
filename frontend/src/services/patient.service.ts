import { api } from "./api/api";
import { PATIENT_ENDPOINTS } from "./api/endpoints";
import type { PaginatedResponse } from "../types/PaginatedResponse";
import type { Patient } from "../types/Admin";
import type { PatientOption } from "./prescriptions.service";

export const patientService = {
  findAll: (params?: { page?: number; limit?: number; query?: string }) =>
    api.get<PaginatedResponse<Patient>>(PATIENT_ENDPOINTS.patients, { params }),

  create: (data: { userId: string; birthDate?: string }) =>
    api.post<Patient>(PATIENT_ENDPOINTS.patients, data),

  findOptions: () => api.get<PatientOption[]>(PATIENT_ENDPOINTS.options),
};
