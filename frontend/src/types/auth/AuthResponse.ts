import { User } from "../User";

export interface AuthResponse {
  status: number;
  accessToken: string;
  refreshToken: string;
  user: User;
  message: string;
}