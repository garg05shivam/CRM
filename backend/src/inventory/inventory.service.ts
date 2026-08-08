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
      newStock = product.current_stock + data.quantity;
    } else {
      if (product.current_stock < data.quantity) {
        throw new AppError(
          "Insufficient stock",
          400,
          "INSUFFICIENT_STOCK",
        );
      }

      newStock =
        product.current_stock - data.quantity;
    }

    const updateResult = await client.query(
      `
        UPDATE products
        SET
          current_stock = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING
          id,
          product_name,
          sku,
          current_stock
      `,
      [newStock, data.productId],
    );

    const movementResult = await client.query(
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
          product_id,
          quantity,
          movement_type,
          reason,
          created_by,
          created_at
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

export const getStockMovements = async (
  productId?: string,
) => {
  const values: unknown[] = [];
  let whereClause = "";

  if (productId) {
    values.push(productId);
    whereClause = `WHERE sm.product_id = $1`;
  }

  const result = await pool.query(
    `
      SELECT
        sm.id,
        sm.product_id,
        p.product_name,
        p.sku,
        sm.quantity,
        sm.movement_type,
        sm.reason,
        sm.created_by,
        u.name AS created_by_name,
        sm.created_at
      FROM stock_movements sm
      INNER JOIN products p
        ON p.id = sm.product_id
      INNER JOIN users u
        ON u.id = sm.created_by
      ${whereClause}
      ORDER BY sm.created_at DESC
    `,
    values,
  );

  return result.rows;
};

export const getLowStockProducts = async () => {
  const result = await pool.query(
    `
      SELECT
        p.id,
        p.product_name,
        p.sku,
        p.category,
        p.current_stock,
        p.minimum_stock_quantity,
        p.warehouse_id,
        w.name AS warehouse_name
      FROM products p
      INNER JOIN warehouses w
        ON w.id = p.warehouse_id
      WHERE
        p.is_active = true
        AND p.current_stock <= p.minimum_stock_quantity
      ORDER BY p.current_stock ASC, p.product_name ASC
    `,
  );

  return result.rows;
};