import { pool } from "../pool.js";
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
        $6,
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