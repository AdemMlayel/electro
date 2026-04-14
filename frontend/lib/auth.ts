import { apiFetch } from "./api";
import { TokenResponse, UserRole } from "./types";
import { decodeToken } from "./jwt";

  export async function login(email: string, password: string): Promise<TokenResponse> {
    return apiFetch<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  export async function register(
    fullName: string,
    email: string,
    password: string
  ): Promise<void> {
    await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        full_name: fullName,
        email,
        password,
      }),
    });
  }

  export interface User {
    id: string;
    email: string;
    role: UserRole;
  }

  export function useAuth() {
    // This would be a client hook, but since it's server, perhaps not.
    // For simplicity, return null
    return {
      user: null,
      logout: () => {},
    };
  }
