import { pool } from "../pool.js";
import { AppError } from "../middlewares/error.middleware.js";
import type { StockMovementData } from "./inventory.types.js";

export const createStockMovement = async (
  data: StockMovementData,
  createdBy: string,
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const productResult = await client.query(
      `
        SELECT
          id,
          product_name,
          sku,
          current_stock
        FROM products
        WHERE id = $1
        FOR UPDATE
      `,
      [data.productId],
    );

    if (productResult.rows.length === 0) {
      throw new AppError(
        "Product not found",
        404,
        "PRODUCT_NOT_FOUND",
      );
    }

    const product = productResult.rows[0];

    let newStock: number;

    if (data.movementType === "IN") {
      newStock =
        product.current_stock +
        data.quantity;
    } else {
      if (
        product.current_stock <
        data.quantity
      ) {
        throw new AppError(
          "Insufficient stock",
          400,
          "INSUFFICIENT_STOCK",
        );
      }

      newStock =
        product.current_stock -
        data.quantity;
    }

    const updateResult =
      await client.query(
        `
          UPDATE products
          SET
            current_stock = $1,
            updated_at = NOW()
          WHERE id = $2
          RETURNING
            id,
            product_name AS "productName",
            sku,
            current_stock AS "currentStock"
        `,
        [
          newStock,
          data.productId,
        ],
      );

    const movementResult =
      await client.query(
        `
          INSERT INTO stock_movements (
            product_id,
            quantity,
            movement_type,
            reason,
            created_by
          )
          VALUES (
            $1,
            $2,
            $3::stock_movement_type,
            $4,
            $5
          )
          RETURNING
            id,
            product_id AS "productId",
            quantity,
            movement_type AS "movementType",
            reason,
            created_by AS "createdBy",
            created_at AS "createdAt"
        `,
        [
          data.productId,
          data.quantity,
          data.movementType,
          data.reason,
          createdBy,
        ],
      );

    await client.query("COMMIT");

    return {
      movement: movementResult.rows[0],
      product: updateResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export interface GetStockMovementsFilter {
  productId?: string;
  movementType?: "IN" | "OUT";
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  unpaginated?: boolean;
}

export const getStockMovements = async (
  options: GetStockMovementsFilter = {},
) => {
  const { productId, movementType, search, startDate, endDate, page = 1, limit = 10, unpaginated } = options;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (productId && productId.trim() !== "") {
    conditions.push(`sm.product_id = $${paramIndex}::uuid`);
    params.push(productId.trim());
    paramIndex += 1;
  }

  if (movementType) {
    conditions.push(`sm.movement_type = $${paramIndex}::stock_movement_type`);
    params.push(movementType);
    paramIndex += 1;
  }

  if (search && search.trim() !== "") {
    conditions.push(
      `(p.product_name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex} OR sm.reason ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex})`,
    );
    params.push(`%${search.trim()}%`);
    paramIndex += 1;
  }

  if (startDate && startDate.trim() !== "") {
    conditions.push(`sm.created_at >= $${paramIndex}::timestamptz`);
    params.push(startDate.trim());
    paramIndex += 1;
  }

  if (endDate && endDate.trim() !== "") {
    conditions.push(`sm.created_at <= $${paramIndex}::timestamptz`);
    params.push(endDate.trim());
    paramIndex += 1;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countQuery = `
    SELECT COUNT(*)::integer AS total
    FROM stock_movements sm
    INNER JOIN products p ON p.id = sm.product_id
    INNER JOIN users u ON u.id = sm.created_by
    ${whereClause}
  `;
  const countResult = await pool.query(countQuery, params);
  const total = countResult.rows[0]?.total ?? 0;

  let query = `
    SELECT
      sm.id,
      sm.product_id AS "productId",
      p.product_name AS "productName",
      p.sku,
      sm.quantity,
      sm.movement_type AS "movementType",
      sm.reason,
      sm.created_by AS "createdBy",
      u.name AS "createdByName",
      sm.created_at AS "createdAt"
    FROM stock_movements sm
    INNER JOIN products p
      ON p.id = sm.product_id
    INNER JOIN users u
      ON u.id = sm.created_by
    ${whereClause}
    ORDER BY sm.created_at DESC
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

export const getLowStockProducts =
  async () => {
    const result = await pool.query(
      `
        SELECT
          p.id,
          p.product_name AS "productName",
          p.sku,
          p.category,
          p.current_stock AS "currentStock",
          p.minimum_stock_quantity AS "minimumStockQuantity",
          p.warehouse_id AS "warehouseId",
          w.name AS "warehouseName"
        FROM products p
        INNER JOIN warehouses w
          ON w.id = p.warehouse_id
        WHERE
          p.is_active = true
          AND p.current_stock <=
              p.minimum_stock_quantity
        ORDER BY
          p.current_stock ASC,
          p.product_name ASC
      `,
    );

    return result.rows;
  };