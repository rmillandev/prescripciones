import { api } from "./api/api";
import { USERS_ENDPOINTS } from "./api/endpoints";
import type { PaginatedResponse } from "../types/PaginatedResponse";
import type { UserSummary } from "../types/Admin";
import type { AuthResponse } from "../types/auth/AuthResponse";

export const usersService = {
  findAll: (params?: { page?: number; limit?: number; role?: string; query?: string }) =>
    api.get<PaginatedResponse<UserSummary>>(USERS_ENDPOINTS.users, { params }),

  create: (data: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>(USERS_ENDPOINTS.users, data),
};
