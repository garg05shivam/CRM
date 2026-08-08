import { pool } from "../pool.js";
import { AppError } from "../middlewares/error.middleware.js";
import { hashPassword } from "../auth/password.js";

import type {
  CreateUserData,
  UpdateUserData,
} from "./user.types.js";

const userSelect = `
  SELECT
    id,
    name,
    email,
    role,
    is_active AS "isActive",
    created_at AS "createdAt",
    updated_at AS "updatedAt"
  FROM users
`;

export const getUsers = async () => {
  const result = await pool.query(
    `
      ${userSelect}
      ORDER BY created_at DESC
    `,
  );

  return result.rows;
};

export const getUserById = async (
  id: string,
) => {
  const result = await pool.query(
    `
      ${userSelect}
      WHERE id = $1
    `,
    [id],
  );

  if (result.rows.length === 0) {
    throw new AppError(
      "User not found",
      404,
      "USER_NOT_FOUND",
    );
  }

  return result.rows[0];
};

export const createUser = async (
  data: CreateUserData,
) => {
  const email =
    data.email.trim().toLowerCase();

  const existingUser =
    await pool.query(
      `
        SELECT id
        FROM users
        WHERE email = $1
        LIMIT 1
      `,
      [email],
    );

  if (existingUser.rows.length > 0) {
    throw new AppError(
      "A user with this email already exists",
      409,
      "EMAIL_ALREADY_EXISTS",
    );
  }

  const passwordHash =
    await hashPassword(
      data.password,
    );

  const result = await pool.query(
    `
      INSERT INTO users (
        name,
        email,
        password_hash,
        role,
        is_active
      )
      VALUES (
        $1,
        $2,
        $3,
        $4::user_role,
        TRUE
      )
      RETURNING
        id,
        name,
        email,
        role,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [
      data.name.trim(),
      email,
      passwordHash,
      data.role,
    ],
  );

  return result.rows[0];
};

export const updateUser = async (
  id: string,
  data: UpdateUserData,
  currentUserId: string,
) => {
  if (
    data.isActive === false &&
    id === currentUserId
  ) {
    throw new AppError(
      "You cannot deactivate your own account",
      400,
      "CANNOT_DEACTIVATE_SELF",
    );
  }

  if (
    data.role !== undefined &&
    id === currentUserId &&
    data.role !== "ADMIN"
  ) {
    throw new AppError(
      "You cannot remove your own ADMIN role",
      400,
      "CANNOT_REMOVE_OWN_ADMIN_ROLE",
    );
  }

  if (
    data.email !== undefined
  ) {
    const email =
      data.email.trim().toLowerCase();

    const existingUser =
      await pool.query(
        `
          SELECT id
          FROM users
          WHERE email = $1
            AND id <> $2
          LIMIT 1
        `,
        [email, id],
      );

    if (
      existingUser.rows.length > 0
    ) {
      throw new AppError(
        "A user with this email already exists",
        409,
        "EMAIL_ALREADY_EXISTS",
      );
    }
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  let parameterIndex = 1;

  if (data.name !== undefined) {
    fields.push(
      `name = $${parameterIndex}`,
    );
    values.push(data.name.trim());
    parameterIndex++;
  }

  if (data.email !== undefined) {
    fields.push(
      `email = $${parameterIndex}`,
    );
    values.push(
      data.email.trim().toLowerCase(),
    );
    parameterIndex++;
  }

  if (data.role !== undefined) {
    fields.push(
      `role = $${parameterIndex}::user_role`,
    );
    values.push(data.role);
    parameterIndex++;
  }

  if (data.isActive !== undefined) {
    fields.push(
      `is_active = $${parameterIndex}`,
    );
    values.push(data.isActive);
    parameterIndex++;
  }

  if (fields.length === 0) {
    return getUserById(id);
  }

  fields.push(
    "updated_at = NOW()",
  );

  values.push(id);

  const result = await pool.query(
    `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE id = $${parameterIndex}
      RETURNING
        id,
        name,
        email,
        role,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    values,
  );

  if (result.rows.length === 0) {
    throw new AppError(
      "User not found",
      404,
      "USER_NOT_FOUND",
    );
  }

  return result.rows[0];
};

export const changeUserPassword =
  async (
    id: string,
    password: string,
  ) => {
    const passwordHash =
      await hashPassword(
        password,
      );

    const result =
      await pool.query(
        `
          UPDATE users
          SET
            password_hash = $1,
            updated_at = NOW()
          WHERE id = $2
          RETURNING
            id,
            name,
            email,
            role,
            is_active AS "isActive",
            created_at AS "createdAt",
            updated_at AS "updatedAt"
        `,
        [passwordHash, id],
      );

    if (
      result.rows.length === 0
    ) {
      throw new AppError(
        "User not found",
        404,
        "USER_NOT_FOUND",
      );
    }

    return result.rows[0];
  };