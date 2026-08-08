import { pool } from "../pool.js";
import { AppError } from "../middlewares/error.middleware.js";
import type {
  CreateProductData,
  UpdateProductData,
} from "./product.types.js";

export const createProduct = async (
  data: CreateProductData,
) => {
  const warehouseResult = await pool.query(
    `
      SELECT id
      FROM warehouses
      WHERE id = $1
        AND is_active = true
    `,
    [data.warehouseId],
  );

  if (warehouseResult.rows.length === 0) {
    throw new AppError(
      "Active warehouse not found",
      404,
      "WAREHOUSE_NOT_FOUND",
    );
  }

  const result = await pool.query(
    `
      INSERT INTO products (
        product_name,
        sku,
        category,
        unit_price,
        minimum_stock_quantity,
        warehouse_id
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
      )
      RETURNING
        id,
        product_name AS "productName",
        sku,
        category,
        unit_price AS "unitPrice",
        current_stock AS "currentStock",
        minimum_stock_quantity AS "minimumStockQuantity",
        warehouse_id AS "warehouseId",
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [
      data.productName,
      data.sku,
      data.category,
      data.unitPrice,
      data.minimumStockQuantity ?? 0,
      data.warehouseId,
    ],
  );

  return result.rows[0];
};

export const getProducts = async (
  search?: string,
) => {
  const result = await pool.query(
    `
      SELECT
        p.id,
        p.product_name AS "productName",
        p.sku,
        p.category,
        p.unit_price AS "unitPrice",
        p.current_stock AS "currentStock",
        p.minimum_stock_quantity AS "minimumStockQuantity",
        p.warehouse_id AS "warehouseId",
        p.is_active AS "isActive",
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt",
        w.name AS "warehouseName"
      FROM products p
      INNER JOIN warehouses w
        ON w.id = p.warehouse_id
      WHERE
        $1 = ''
        OR p.product_name ILIKE '%' || $1 || '%'
        OR p.sku ILIKE '%' || $1 || '%'
        OR p.category ILIKE '%' || $1 || '%'
      ORDER BY p.created_at DESC
    `,
    [search ?? ""],
  );

  return result.rows;
};

export const getProductById = async (
  id: string,
) => {
  const result = await pool.query(
    `
      SELECT
        p.id,
        p.product_name AS "productName",
        p.sku,
        p.category,
        p.unit_price AS "unitPrice",
        p.current_stock AS "currentStock",
        p.minimum_stock_quantity AS "minimumStockQuantity",
        p.warehouse_id AS "warehouseId",
        p.is_active AS "isActive",
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt",
        w.name AS "warehouseName",
        w.location AS "warehouseLocation"
      FROM products p
      INNER JOIN warehouses w
        ON w.id = p.warehouse_id
      WHERE p.id = $1
    `,
    [id],
  );

  if (result.rows.length === 0) {
    throw new AppError(
      "Product not found",
      404,
      "PRODUCT_NOT_FOUND",
    );
  }

  return result.rows[0];
};

export const updateProduct = async (
  id: string,
  data: UpdateProductData,
) => {
  if (data.warehouseId !== undefined) {
    const warehouseResult = await pool.query(
      `
        SELECT id
        FROM warehouses
        WHERE id = $1
          AND is_active = true
      `,
      [data.warehouseId],
    );

    if (warehouseResult.rows.length === 0) {
      throw new AppError(
        "Active warehouse not found",
        404,
        "WAREHOUSE_NOT_FOUND",
      );
    }
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  let parameterIndex = 1;

  const addField = (
    column: string,
    value: unknown,
  ) => {
    fields.push(
      `${column} = $${parameterIndex}`,
    );

    values.push(value);
    parameterIndex += 1;
  };

  if (data.productName !== undefined) {
    addField(
      "product_name",
      data.productName,
    );
  }

  if (data.sku !== undefined) {
    addField("sku", data.sku);
  }

  if (data.category !== undefined) {
    addField(
      "category",
      data.category,
    );
  }

  if (data.unitPrice !== undefined) {
    addField(
      "unit_price",
      data.unitPrice,
    );
  }

  if (
    data.minimumStockQuantity !== undefined
  ) {
    addField(
      "minimum_stock_quantity",
      data.minimumStockQuantity,
    );
  }

  if (data.warehouseId !== undefined) {
    addField(
      "warehouse_id",
      data.warehouseId,
    );
  }

  if (data.isActive !== undefined) {
    addField(
      "is_active",
      data.isActive,
    );
  }

  if (fields.length === 0) {
    return getProductById(id);
  }

  fields.push("updated_at = NOW()");

  values.push(id);

  const result = await pool.query(
    `
      UPDATE products
      SET ${fields.join(", ")}
      WHERE id = $${parameterIndex}
      RETURNING
        id,
        product_name AS "productName",
        sku,
        category,
        unit_price AS "unitPrice",
        current_stock AS "currentStock",
        minimum_stock_quantity AS "minimumStockQuantity",
        warehouse_id AS "warehouseId",
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    values,
  );

  if (result.rows.length === 0) {
    throw new AppError(
      "Product not found",
      404,
      "PRODUCT_NOT_FOUND",
    );
  }

  return result.rows[0];
};

export const deleteProduct = async (
  id: string,
) => {
  const result = await pool.query(
    `
      DELETE FROM products
      WHERE id = $1
      RETURNING id
    `,
    [id],
  );

  if (result.rows.length === 0) {
    throw new AppError(
      "Product not found",
      404,
      "PRODUCT_NOT_FOUND",
    );
  }

  return result.rows[0];
};