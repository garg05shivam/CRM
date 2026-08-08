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
        customer_name,
        mobile_number,
        email,
        business_name,
        gst_number,
        customer_type,
        address,
        status,
        follow_up_date,
        notes,
        created_at,
        updated_at
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

export const getCustomers = async (
  search?: string,
) => {
  const result = await pool.query(
    `
      SELECT
        id,
        customer_name,
        mobile_number,
        email,
        business_name,
        gst_number,
        customer_type,
        address,
        status,
        follow_up_date,
        notes,
        created_at,
        updated_at
      FROM customers
      WHERE
        $1 = ''
        OR customer_name ILIKE '%' || $1 || '%'
        OR mobile_number ILIKE '%' || $1 || '%'
        OR business_name ILIKE '%' || $1 || '%'
        OR email ILIKE '%' || $1 || '%'
      ORDER BY created_at DESC
    `,
    [search ?? ""],
  );

  return result.rows;
};

export const getCustomerById = async (
  id: string,
) => {
  const result = await pool.query(
    `
      SELECT
        id,
        customer_name,
        mobile_number,
        email,
        business_name,
        gst_number,
        customer_type,
        address,
        status,
        follow_up_date,
        notes,
        created_at,
        updated_at
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
    addField("customer_name", data.customerName);
  }

  if (data.mobileNumber !== undefined) {
    addField("mobile_number", data.mobileNumber);
  }

  if (data.email !== undefined) {
    addField(
      "email",
      data.email,
      `NULLIF($${parameterIndex}, '')`,
    );
  }

  if (data.businessName !== undefined) {
    addField("business_name", data.businessName);
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
    addField("address", data.address);
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
        customer_name,
        mobile_number,
        email,
        business_name,
        gst_number,
        customer_type,
        address,
        status,
        follow_up_date,
        notes,
        created_at,
        updated_at
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