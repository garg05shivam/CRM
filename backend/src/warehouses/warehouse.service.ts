import { pool } from "../pool.js";
import { AppError } from "../middlewares/error.middleware.js";
import type {
  CreateWarehouseData,
  UpdateWarehouseData,
} from "./warehouse.types.js";

export const createWarehouse = async (
  data: CreateWarehouseData,
) => {
  const result = await pool.query(
    `
      INSERT INTO warehouses (
        name,
        location
      )
      VALUES ($1, $2)
      RETURNING
        id,
        name,
        location,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [data.name, data.location],
  );

  return result.rows[0];
};

export const getWarehouses = async () => {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        location,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM warehouses
      ORDER BY created_at DESC
    `,
  );

  return result.rows;
};

export const getWarehouseById = async (
  id: string,
) => {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        location,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM warehouses
      WHERE id = $1
    `,
    [id],
  );

  if (result.rows.length === 0) {
    throw new AppError(
      "Warehouse not found",
      404,
      "WAREHOUSE_NOT_FOUND",
    );
  }

  return result.rows[0];
};

export const updateWarehouse = async (
  id: string,
  data: UpdateWarehouseData,
) => {
  const fields: string[] = [];
  const values: unknown[] = [];
  let parameterIndex = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${parameterIndex}`);
    values.push(data.name);
    parameterIndex++;
  }

  if (data.location !== undefined) {
    fields.push(`location = $${parameterIndex}`);
    values.push(data.location);
    parameterIndex++;
  }

  if (data.isActive !== undefined) {
    fields.push(`is_active = $${parameterIndex}`);
    values.push(data.isActive);
    parameterIndex++;
  }

  if (fields.length === 0) {
    return getWarehouseById(id);
  }

  fields.push("updated_at = NOW()");
  values.push(id);

  const result = await pool.query(
    `
      UPDATE warehouses
      SET ${fields.join(", ")}
      WHERE id = $${parameterIndex}
      RETURNING
        id,
        name,
        location,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    values,
  );

  if (result.rows.length === 0) {
    throw new AppError(
      "Warehouse not found",
      404,
      "WAREHOUSE_NOT_FOUND",
    );
  }

  return result.rows[0];
};

export const deleteWarehouse = async (
  id: string,
) => {
  const result = await pool.query(
    `
      DELETE FROM warehouses
      WHERE id = $1
      RETURNING id
    `,
    [id],
  );

  if (result.rows.length === 0) {
    throw new AppError(
      "Warehouse not found",
      404,
      "WAREHOUSE_NOT_FOUND",
    );
  }

  return result.rows[0];
};