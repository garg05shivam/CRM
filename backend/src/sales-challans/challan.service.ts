import { pool } from "../pool.js";
import { AppError } from "../middlewares/error.middleware.js";
import type {
  CreateChallanData,
} from "./challan.types.js";

const generateChallanNumber = () => {
  const timestamp = Date.now();

  const random = Math.floor(
    1000 + Math.random() * 9000,
  );

  return `CH-${timestamp}-${random}`;
};

export const createChallan = async (
  data: CreateChallanData,
  createdBy: string,
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const customerResult =
      await client.query(
        `
          SELECT id
          FROM customers
          WHERE id = $1
        `,
        [data.customerId],
      );

    if (
      customerResult.rows.length === 0
    ) {
      throw new AppError(
        "Customer not found",
        404,
        "CUSTOMER_NOT_FOUND",
      );
    }

    const productIds = data.items.map(
      (item) => item.productId,
    );

    const uniqueProductIds =
      new Set(productIds);

    if (
      uniqueProductIds.size !==
      productIds.length
    ) {
      throw new AppError(
        "A product can appear only once in a challan",
        400,
        "DUPLICATE_PRODUCT",
      );
    }

    const productResult =
      await client.query(
        `
          SELECT
            id,
            product_name,
            sku,
            unit_price,
            current_stock,
            is_active
          FROM products
          WHERE id = ANY($1::uuid[])
          FOR UPDATE
        `,
        [productIds],
      );

    if (
      productResult.rows.length !==
      data.items.length
    ) {
      throw new AppError(
        "One or more products were not found",
        404,
        "PRODUCT_NOT_FOUND",
      );
    }

    for (const item of data.items) {
      const product =
        productResult.rows.find(
          (row) =>
            row.id === item.productId,
        );

      if (!product) {
        throw new AppError(
          "Product not found",
          404,
          "PRODUCT_NOT_FOUND",
        );
      }

      if (!product.is_active) {
        throw new AppError(
          `Product ${product.product_name} is inactive`,
          400,
          "PRODUCT_INACTIVE",
        );
      }
    }

    const totalQuantity =
      data.items.reduce(
        (total, item) =>
          total + item.quantity,
        0,
      );

    const challanNumber =
      generateChallanNumber();

    const challanResult =
      await client.query(
        `
          INSERT INTO sales_challans (
            challan_number,
            customer_id,
            total_quantity,
            status,
            created_by
          )
          VALUES (
            $1,
            $2,
            $3,
            'DRAFT'::challan_status,
            $4
          )
          RETURNING
            id,
            challan_number AS "challanNumber",
            customer_id AS "customerId",
            total_quantity AS "totalQuantity",
            status,
            created_by AS "createdBy",
            created_at AS "createdAt",
            updated_at AS "updatedAt"
        `,
        [
          challanNumber,
          data.customerId,
          totalQuantity,
          createdBy,
        ],
      );

    const challan =
      challanResult.rows[0];

    for (const item of data.items) {
      const product =
        productResult.rows.find(
          (row) =>
            row.id === item.productId,
        );

      if (!product) {
        throw new AppError(
          "Product not found",
          404,
          "PRODUCT_NOT_FOUND",
        );
      }

      await client.query(
        `
          INSERT INTO sales_challan_items (
            challan_id,
            product_id,
            product_name_snapshot,
            sku_snapshot,
            unit_price_snapshot,
            quantity
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6
          )
        `,
        [
          challan.id,
          item.productId,
          product.product_name,
          product.sku,
          product.unit_price,
          item.quantity,
        ],
      );
    }

    await client.query("COMMIT");

    return getChallanById(challan.id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getChallans = async () => {
  const result = await pool.query(
    `
      SELECT
        sc.id,
        sc.challan_number AS "challanNumber",
        sc.customer_id AS "customerId",
        c.customer_name AS "customerName",
        sc.total_quantity AS "totalQuantity",
        sc.status,
        sc.created_by AS "createdBy",
        u.name AS "createdByName",
        sc.created_at AS "createdAt",
        sc.updated_at AS "updatedAt"
      FROM sales_challans sc
      INNER JOIN customers c
        ON c.id = sc.customer_id
      INNER JOIN users u
        ON u.id = sc.created_by
      ORDER BY sc.created_at DESC
    `,
  );

  return result.rows;
};

export const getChallanById = async (
  id: string,
) => {
  const challanResult =
    await pool.query(
      `
        SELECT
          sc.id,
          sc.challan_number AS "challanNumber",
          sc.customer_id AS "customerId",
          c.customer_name AS "customerName",
          sc.total_quantity AS "totalQuantity",
          sc.status,
          sc.created_by AS "createdBy",
          u.name AS "createdByName",
          sc.created_at AS "createdAt",
          sc.updated_at AS "updatedAt"
        FROM sales_challans sc
        INNER JOIN customers c
          ON c.id = sc.customer_id
        INNER JOIN users u
          ON u.id = sc.created_by
        WHERE sc.id = $1
      `,
      [id],
    );

  if (
    challanResult.rows.length === 0
  ) {
    throw new AppError(
      "Sales challan not found",
      404,
      "CHALLAN_NOT_FOUND",
    );
  }

  const itemsResult =
    await pool.query(
      `
        SELECT
          id,
          challan_id AS "challanId",
          product_id AS "productId",
          product_name_snapshot AS "productNameSnapshot",
          sku_snapshot AS "skuSnapshot",
          unit_price_snapshot AS "unitPriceSnapshot",
          quantity,
          created_at AS "createdAt"
        FROM sales_challan_items
        WHERE challan_id = $1
        ORDER BY created_at ASC
      `,
      [id],
    );

  return {
    ...challanResult.rows[0],
    items: itemsResult.rows,
  };
};

export const confirmChallan = async (
  id: string,
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const challanResult =
      await client.query(
        `
          SELECT
            id,
            status,
            customer_id
          FROM sales_challans
          WHERE id = $1
          FOR UPDATE
        `,
        [id],
      );

    if (
      challanResult.rows.length === 0
    ) {
      throw new AppError(
        "Sales challan not found",
        404,
        "CHALLAN_NOT_FOUND",
      );
    }

    const challan =
      challanResult.rows[0];

    if (challan.status !== "DRAFT") {
      throw new AppError(
        "Only draft challans can be confirmed",
        400,
        "INVALID_CHALLAN_STATUS",
      );
    }

    const itemsResult =
      await client.query(
        `
          SELECT
            id,
            product_id,
            quantity,
            product_name_snapshot,
            sku_snapshot
          FROM sales_challan_items
          WHERE challan_id = $1
          FOR UPDATE
        `,
        [id],
      );

    if (itemsResult.rows.length === 0) {
      throw new AppError(
        "Challan has no items",
        400,
        "EMPTY_CHALLAN",
      );
    }

    const productIds =
      itemsResult.rows.map(
        (item) => item.product_id,
      );

    const productsResult =
      await client.query(
        `
          SELECT
            id,
            product_name,
            current_stock,
            is_active
          FROM products
          WHERE id = ANY($1::uuid[])
          FOR UPDATE
        `,
        [productIds],
      );

    for (const item of itemsResult.rows) {
      const product =
        productsResult.rows.find(
          (row) =>
            row.id === item.product_id,
        );

      if (!product) {
        throw new AppError(
          "Product not found",
          404,
          "PRODUCT_NOT_FOUND",
        );
      }

      if (!product.is_active) {
        throw new AppError(
          `Product ${product.product_name} is inactive`,
          400,
          "PRODUCT_INACTIVE",
        );
      }

      if (
        product.current_stock <
        item.quantity
      ) {
        throw new AppError(
          `Insufficient stock for ${product.product_name}`,
          400,
          "INSUFFICIENT_STOCK",
        );
      }
    }

    for (const item of itemsResult.rows) {
      const product =
        productsResult.rows.find(
          (row) =>
            row.id === item.product_id,
        );

      if (!product) {
        throw new AppError(
          "Product not found",
          404,
          "PRODUCT_NOT_FOUND",
        );
      }

      const newStock =
        product.current_stock -
        item.quantity;

      await client.query(
        `
          UPDATE products
          SET
            current_stock = $1,
            updated_at = NOW()
          WHERE id = $2
        `,
        [
          newStock,
          product.id,
        ],
      );

      await client.query(
        `
          INSERT INTO stock_movements (
            product_id,
            quantity,
            movement_type,
            reason,
            created_by
          )
          SELECT
            $1,
            $2,
            'OUT'::stock_movement_type,
            $3,
            created_by
          FROM sales_challans
          WHERE id = $4
        `,
        [
          product.id,
          item.quantity,
          "Sales challan confirmation",
          id,
        ],
      );
    }

    await client.query(
      `
        UPDATE sales_challans
        SET
          status =
            'CONFIRMED'::challan_status,
          updated_at = NOW()
        WHERE id = $1
      `,
      [id],
    );

    await client.query("COMMIT");

    return getChallanById(id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const cancelChallan = async (
  id: string,
) => {
  const result = await pool.query(
    `
      UPDATE sales_challans
      SET
        status =
          'CANCELLED'::challan_status,
        updated_at = NOW()
      WHERE id = $1
        AND status =
          'DRAFT'::challan_status
      RETURNING
        id,
        challan_number AS "challanNumber",
        status,
        updated_at AS "updatedAt"
    `,
    [id],
  );

  if (result.rows.length === 0) {
    const existing =
      await pool.query(
        `
          SELECT
            id,
            status
          FROM sales_challans
          WHERE id = $1
        `,
        [id],
      );

    if (
      existing.rows.length === 0
    ) {
      throw new AppError(
        "Sales challan not found",
        404,
        "CHALLAN_NOT_FOUND",
      );
    }

    throw new AppError(
      "Only draft challans can be cancelled",
      400,
      "INVALID_CHALLAN_STATUS",
    );
  }

  return result.rows[0];
};