const AUTH_ENDPOINTS = {
    login: "/auth/login",
    register: "/auth/register",
} as const;

const USER_ENDPOINTS = { 
    users: "/users",
}

export { AUTH_ENDPOINTS, USER_ENDPOINTS };