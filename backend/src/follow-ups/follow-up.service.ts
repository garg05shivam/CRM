import { pool } from "../pool.js";
import { AppError } from "../middlewares/error.middleware.js";

interface CreateFollowUpData {
  note: string;
  followUpDate: string;
}

interface UpdateFollowUpData {
  note?: string;
  followUpDate?: string;
}

export const createFollowUp = async (
  customerId: string,
  createdBy: string,
  data: CreateFollowUpData,
) => {
  const customerResult = await pool.query(
    `
      SELECT id
      FROM customers
      WHERE id = $1
    `,
    [customerId],
  );

  if (customerResult.rows.length === 0) {
    throw new AppError(
      "Customer not found",
      404,
      "CUSTOMER_NOT_FOUND",
    );
  }

  const result = await pool.query(
    `
      INSERT INTO customer_follow_ups (
        customer_id,
        note,
        follow_up_date,
        created_by
      )
      VALUES (
        $1,
        $2,
        $3::date,
        $4
      )
      RETURNING
        id,
        customer_id,
        note,
        follow_up_date,
        created_by,
        created_at
    `,
    [
      customerId,
      data.note,
      data.followUpDate,
      createdBy,
    ],
  );

  return result.rows[0];
};

export const getCustomerFollowUps = async (
  customerId: string,
) => {
  const customerResult = await pool.query(
    `
      SELECT id
      FROM customers
      WHERE id = $1
    `,
    [customerId],
  );

  if (customerResult.rows.length === 0) {
    throw new AppError(
      "Customer not found",
      404,
      "CUSTOMER_NOT_FOUND",
    );
  }

  const result = await pool.query(
    `
      SELECT
        id,
        customer_id,
        note,
        follow_up_date,
        created_by,
        created_at
      FROM customer_follow_ups
      WHERE customer_id = $1
      ORDER BY follow_up_date DESC, created_at DESC
    `,
    [customerId],
  );

  return result.rows;
};

export const updateFollowUp = async (
  id: string,
  data: UpdateFollowUpData,
) => {
  const fields: string[] = [];
  const values: unknown[] = [];
  let parameterIndex = 1;

  if (data.note !== undefined) {
    fields.push(`note = $${parameterIndex}`);
    values.push(data.note);
    parameterIndex += 1;
  }

  if (data.followUpDate !== undefined) {
    fields.push(
      `follow_up_date = $${parameterIndex}::date`,
    );
    values.push(data.followUpDate);
    parameterIndex += 1;
  }

  if (fields.length === 0) {
    const existing = await pool.query(
      `
        SELECT
          id,
          customer_id,
          note,
          follow_up_date,
          created_by,
          created_at
        FROM customer_follow_ups
        WHERE id = $1
      `,
      [id],
    );

    if (existing.rows.length === 0) {
      throw new AppError(
        "Follow-up not found",
        404,
        "FOLLOW_UP_NOT_FOUND",
      );
    }

    return existing.rows[0];
  }

  values.push(id);

  const result = await pool.query(
    `
      UPDATE customer_follow_ups
      SET ${fields.join(", ")}
      WHERE id = $${parameterIndex}
      RETURNING
        id,
        customer_id,
        note,
        follow_up_date,
        created_by,
        created_at
    `,
    values,
  );

  if (result.rows.length === 0) {
    throw new AppError(
      "Follow-up not found",
      404,
      "FOLLOW_UP_NOT_FOUND",
    );
  }

  return result.rows[0];
};

export const deleteFollowUp = async (
  id: string,
) => {
  const result = await pool.query(
    `
      DELETE FROM customer_follow_ups
      WHERE id = $1
      RETURNING id
    `,
    [id],
  );

  if (result.rows.length === 0) {
    throw new AppError(
      "Follow-up not found",
      404,
      "FOLLOW_UP_NOT_FOUND",
    );
  }

  return result.rows[0];
};

export const getAllFollowUps = async (
  search?: string,
  date?: string,
) => {
  const values: unknown[] = [];
  const conditions: string[] = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(
      `(c.customer_name ILIKE $${paramIdx} OR c.business_name ILIKE $${paramIdx} OR f.note ILIKE $${paramIdx})`,
    );
    values.push(`%${search}%`);
    paramIdx++;
  }

  if (date) {
    conditions.push(`f.follow_up_date = $${paramIdx}::date`);
    values.push(date);
    paramIdx++;
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  const result = await pool.query(
    `
      SELECT
        f.id,
        f.customer_id AS "customerId",
        c.customer_name AS "customerName",
        c.business_name AS "businessName",
        c.mobile_number AS "mobileNumber",
        f.note,
        f.follow_up_date AS "followUpDate",
        f.created_by AS "createdBy",
        u.name AS "createdByName",
        f.created_at AS "createdAt"
      FROM customer_follow_ups f
      INNER JOIN customers c ON c.id = f.customer_id
      INNER JOIN users u ON u.id = f.created_by
      ${whereClause}
      ORDER BY f.follow_up_date ASC, f.created_at DESC
    `,
    values,
  );

  return result.rows;
};