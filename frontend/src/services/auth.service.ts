import {api } from "./api/api";
import { AuthResponse } from "../types/auth/AuthResponse";
import { LoginCredentials } from "../types/auth/LoginCredentials";
import { AUTH_ENDPOINTS } from "./api/endpoints";


export const authService = { 
    login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>(AUTH_ENDPOINTS.login, credentials),
};

