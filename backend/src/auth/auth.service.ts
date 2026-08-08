import { pool } from "../pool.js";
import { comparePassword } from "./password.js";
import { generateAccessToken } from "./jwt.js";
import type {
  AuthenticatedUser,
  LoginRequest,
} from "./auth.types.js";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: AuthenticatedUser["role"];
  is_active: boolean;
}

export const loginUser = async (
  credentials: LoginRequest,
): Promise<{
  user: AuthenticatedUser;
  accessToken: string;
}> => {
  const result = await pool.query<UserRecord>(
    `
      SELECT
        id,
        name,
        email,
        password_hash,
        role,
        is_active
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [credentials.email.toLowerCase()],
  );

  const user = result.rows[0];

  if (!user || !user.is_active) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordMatches = await comparePassword(
    credentials.password,
    user.password_hash,
  );

  if (!passwordMatches) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const authenticatedUser: AuthenticatedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
  });

  return {
    user: authenticatedUser,
    accessToken,
  };
};