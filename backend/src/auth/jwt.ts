import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { UserRole } from "./auth.types.js";

export interface AuthTokenPayload {
  userId: string;
  role: UserRole;
}

export const generateAccessToken = (
  payload: AuthTokenPayload,
): string => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
};

export const verifyAccessToken = (
  token: string,
): AuthTokenPayload => {
  return jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
};