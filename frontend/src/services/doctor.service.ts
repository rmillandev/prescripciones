import { api } from "./api/api";
import { DOCTOR_ENDPOINTS } from "./api/endpoints";
import type { PaginatedResponse } from "../types/PaginatedResponse";
import type { Doctor } from "../types/Admin";

export const doctorService = {
  findAll: (params?: { page?: number; limit?: number; query?: string; specialty?: string }) =>
    api.get<PaginatedResponse<Doctor>>(DOCTOR_ENDPOINTS.doctors, { params }),

  create: (data: { userId: string; specialty?: string }) =>
    api.post<Doctor>(DOCTOR_ENDPOINTS.doctors, data),
};
