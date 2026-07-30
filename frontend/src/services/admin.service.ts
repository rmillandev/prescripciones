import { api } from "./api/api";
import { ADMIN_ENDPOINTS } from "./api/endpoints";
import type { MetricsResponse } from "../types/Metrics";

export const adminService = {
  getMetrics: (filters?: { from?: string; to?: string }) =>
    api.get<MetricsResponse>(ADMIN_ENDPOINTS.metrics, {
      params: filters as Record<string, string>,
    }),
};
