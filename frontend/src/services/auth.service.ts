import {api } from "./api/api";
import { AuthResponse } from "../types/auth/AuthResponse";
import { LoginCredentials } from "../types/auth/LoginCredentials";
import { AUTH_ENDPOINTS } from "./api/endpoints";

function validateLogin(credentials: LoginCredentials) {
  const errors: string[] = [];

  if (!credentials.email?.trim()) {
    errors.push("El correo electronico es obligatorio");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
    errors.push("El correo electronico no es valido");
  }

  if (!credentials.password) {
    errors.push("La contrasena es obligatoria");
  } else if (credentials.password.length < 6) {
    errors.push("La contrasena debe tener al menos 6 caracteres");
  }

  if (errors.length > 0) {
    throw new Error(errors.join(", "));
  }
}

function validateRegister(data: LoginCredentials & { name: string }) {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push("El nombre es obligatorio");
  }

  if (!data.email?.trim()) {
    errors.push("El correo electronico es obligatorio");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("El correo electronico no es valido");
  }

  if (!data.password) {
    errors.push("La contrasena es obligatoria");
  } else if (data.password.length < 6) {
    errors.push("La contrasena debe tener al menos 6 caracteres");
  }

  if (errors.length > 0) {
    throw new Error(errors.join(", "));
  }
}

export const authService = { 
    login: (credentials: LoginCredentials) => {
      validateLogin(credentials);
      return api.post<AuthResponse>(AUTH_ENDPOINTS.login, credentials);
    },

    register: (data: LoginCredentials & { name: string }) => {
      validateRegister(data);
      return api.post<AuthResponse>(AUTH_ENDPOINTS.register, data);
    },
};
