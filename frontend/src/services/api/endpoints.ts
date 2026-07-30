const AUTH_ENDPOINTS = {
    login: "/auth/login",
    register: "/auth/register",
} as const;

const USERS_ENDPOINTS = {
    users: "/users",
} as const;

const DOCTOR_ENDPOINTS = {
    doctors: "/doctor",
} as const;

const PATIENT_ENDPOINTS = {
    patients: "/patient",
} as const;

const ADMIN_ENDPOINTS = {
    metrics: "/admin/metrics",
} as const;

export { AUTH_ENDPOINTS, USERS_ENDPOINTS, DOCTOR_ENDPOINTS, PATIENT_ENDPOINTS, ADMIN_ENDPOINTS };
