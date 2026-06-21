import { ApiError } from "./ApiError";

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError) {
    if (
      typeof error.data === "object" &&
      error.data !== null &&
      "message" in error.data
    ) {
      const message = error.data.message;
      return Array.isArray(message) ? message.join(", ") : String(message);
    }

    return error.message;
  }

  return fallbackMessage;
}
