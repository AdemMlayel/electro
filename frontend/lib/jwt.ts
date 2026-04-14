import { jwtDecode } from "jwt-decode";
import { UserRole } from "./types";

interface JwtPayload {
  sub: string;
  exp: number;
  role?: UserRole;
}

export function decodeToken(token: string): JwtPayload {
  return jwtDecode(token);
}
