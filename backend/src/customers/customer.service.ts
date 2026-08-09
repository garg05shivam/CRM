import { pool } from "../pool.js";
import { AppError } from "../middlewares/error.middleware.js";
import type {
  CustomerStatus,
  CustomerType,
} from "./customer.types.js";

interface CreateCustomerData {
  customerName: string;
  mobileNumber: string;
  email?: string;
  businessName: string;
  gstNumber?: string;
  customerType: CustomerType;
  address: string;
  status?: CustomerStatus;
  followUpDate?: string;
  notes?: string;
}

interface UpdateCustomerData {
  customerName?: string;
  mobileNumber?: string;
  email?: string;
  businessName?: string;
  gstNumber?: string;
  customerType?: CustomerType;
  address?: string;
  status?: CustomerStatus;
  followUpDate?: string;
  notes?: string;
}

export const createCustomer = async (
  data: CreateCustomerData,
) => {
  const result = await pool.query(
    `
      INSERT INTO customers (
        customer_name,
        mobile_number,
        email,
        business_name,
        gst_number,
        customer_type,
        address,
        status,
        follow_up_date,
        notes
      )
      VALUES (
        $1,
        $2,
        NULLIF($3, ''),
        $4,
        NULLIF($5, ''),
        $6::customer_type,
        $7,
        COALESCE(
          $8::customer_status,
          'LEAD'::customer_status
        ),
        NULLIF($9, '')::date,
        NULLIF($10, '')
      )
      RETURNING
        id,
        customer_name AS "customerName",
        mobile_number AS "mobileNumber",
        email,
        business_name AS "businessName",
        gst_number AS "gstNumber",
        customer_type AS "customerType",
        address,
        status,
        follow_up_date AS "followUpDate",
        notes,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [
      data.customerName,
      data.mobileNumber,
      data.email ?? "",
      data.businessName,
      data.gstNumber ?? "",
      data.customerType,
      data.address,
      data.status ?? "LEAD",
      data.followUpDate ?? "",
      data.notes ?? "",
    ],
  );

  return result.rows[0];
};

export interface GetCustomersFilter {
  search?: string;
  status?: CustomerStatus;
  customerType?: CustomerType;
  page?: number;
  limit?: number;
  unpaginated?: boolean;
}

export const getCustomers = async (
  options: GetCustomersFilter = {},
) => {
  const { search, status, customerType, page = 1, limit = 10, unpaginated } = options;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (search && search.trim() !== "") {
    conditions.push(
      `(customer_name ILIKE $${paramIndex} OR mobile_number ILIKE $${paramIndex} OR business_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`,
    );
    params.push(`%${search.trim()}%`);
    paramIndex += 1;
  }

  if (status) {
    conditions.push(`status = $${paramIndex}::customer_status`);
    params.push(status);
    paramIndex += 1;
  }

  if (customerType) {
    conditions.push(`customer_type = $${paramIndex}::customer_type`);
    params.push(customerType);
    paramIndex += 1;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countQuery = `SELECT COUNT(*)::integer AS total FROM customers ${whereClause}`;
  const countResult = await pool.query(countQuery, params);
  const total = countResult.rows[0]?.total ?? 0;

  let query = `
    SELECT
      id,
      customer_name AS "customerName",
      mobile_number AS "mobileNumber",
      email,
      business_name AS "businessName",
      gst_number AS "gstNumber",
      customer_type AS "customerType",
      address,
      status,
      follow_up_date AS "followUpDate",
      notes,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM customers
    ${whereClause}
    ORDER BY created_at DESC
  `;

  if (!unpaginated) {
    const offset = (Math.max(1, page) - 1) * Math.max(1, limit);
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
  }

  const result = await pool.query(query, params);

  const totalPages = Math.ceil(total / Math.max(1, limit)) || 1;

  return {
    data: result.rows,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

export const getCustomerById = async (
  id: string,
) => {
  const result = await pool.query(
    `
      SELECT
        id,
        customer_name AS "customerName",
        mobile_number AS "mobileNumber",
        email,
        business_name AS "businessName",
        gst_number AS "gstNumber",
        customer_type AS "customerType",
        address,
        status,
        follow_up_date AS "followUpDate",
        notes,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM customers
      WHERE id = $1
    `,
    [id],
  );

  if (result.rows.length === 0) {
    throw new AppError(
      "Customer not found",
      404,
      "CUSTOMER_NOT_FOUND",
    );
  }

  return result.rows[0];
};

export const updateCustomer = async (
  id: string,
  data: UpdateCustomerData,
) => {
  const fields: string[] = [];
  const values: unknown[] = [];
  let parameterIndex = 1;

  const addField = (
    column: string,
    value: unknown,
    expression = `$${parameterIndex}`,
  ) => {
    fields.push(`${column} = ${expression}`);
    values.push(value);
    parameterIndex += 1;
  };

  if (data.customerName !== undefined) {
    addField(
      "customer_name",
      data.customerName,
    );
  }

  if (data.mobileNumber !== undefined) {
    addField(
      "mobile_number",
      data.mobileNumber,
    );
  }

  if (data.email !== undefined) {
    addField(
      "email",
      data.email,
      `NULLIF($${parameterIndex}, '')`,
    );
  }

  if (data.businessName !== undefined) {
    addField(
      "business_name",
      data.businessName,
    );
  }

  if (data.gstNumber !== undefined) {
    addField(
      "gst_number",
      data.gstNumber,
      `NULLIF($${parameterIndex}, '')`,
    );
  }

  if (data.customerType !== undefined) {
    addField(
      "customer_type",
      data.customerType,
      `$${parameterIndex}::customer_type`,
    );
  }

  if (data.address !== undefined) {
    addField(
      "address",
      data.address,
    );
  }

  if (data.status !== undefined) {
    addField(
      "status",
      data.status,
      `$${parameterIndex}::customer_status`,
    );
  }

  if (data.followUpDate !== undefined) {
    addField(
      "follow_up_date",
      data.followUpDate,
      `NULLIF($${parameterIndex}, '')::date`,
    );
  }

  if (data.notes !== undefined) {
    addField(
      "notes",
      data.notes,
      `NULLIF($${parameterIndex}, '')`,
    );
  }

  if (fields.length === 0) {
    return getCustomerById(id);
  }

  fields.push("updated_at = NOW()");
  values.push(id);

  const result = await pool.query(
    `
      UPDATE customers
      SET ${fields.join(", ")}
      WHERE id = $${parameterIndex}
      RETURNING
        id,
        customer_name AS "customerName",
        mobile_number AS "mobileNumber",
        email,
        business_name AS "businessName",
        gst_number AS "gstNumber",
        customer_type AS "customerType",
        address,
        status,
        follow_up_date AS "followUpDate",
        notes,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    values,
  );

  if (result.rows.length === 0) {
    throw new AppError(
      "Customer not found",
      404,
      "CUSTOMER_NOT_FOUND",
    );
  }

  return result.rows[0];
};

export const deleteCustomer = async (
  id: string,
) => {
  const result = await pool.query(
    `
      DELETE FROM customers
      WHERE id = $1
      RETURNING id
    `,
    [id],
  );

  if (result.rows.length === 0) {
    throw new AppError(
      "Customer not found",
      404,
      "CUSTOMER_NOT_FOUND",
    );
  }

  return result.rows[0];
};