import { pool } from "../pool.js";

export const getDashboardSummary = async () => {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM customers) AS total_customers,
      (SELECT COUNT(*) FROM products WHERE is_active = true) AS active_products,
      (SELECT COUNT(*) FROM warehouses WHERE is_active = true) AS active_warehouses,
      (
        SELECT COUNT(*)
        FROM sales_challans
        WHERE status = 'CONFIRMED'::challan_status
      ) AS confirmed_challans,
      (
        SELECT COALESCE(SUM(total_quantity), 0)
        FROM sales_challans
        WHERE status = 'CONFIRMED'::challan_status
      ) AS total_sold_quantity,
      (
        SELECT COALESCE(SUM(current_stock), 0)
        FROM products
        WHERE is_active = true
      ) AS total_current_stock,
      (
        SELECT COUNT(*)
        FROM products
        WHERE is_active = true
          AND current_stock <= minimum_stock_quantity
      ) AS low_stock_products,
      (
        SELECT COUNT(*)
        FROM customer_follow_ups
        WHERE follow_up_date = CURRENT_DATE
      ) AS follow_ups_today
  `);

  return result.rows[0];
};

export const getRecentChallans = async () => {
  const result = await pool.query(`
    SELECT
      sc.id,
      sc.challan_number,
      sc.customer_id,
      c.customer_name,
      sc.total_quantity,
      sc.status,
      sc.created_at
    FROM sales_challans sc
    INNER JOIN customers c
      ON c.id = sc.customer_id
    ORDER BY sc.created_at DESC
    LIMIT 10
  `);

  return result.rows;
};

export const getRecentStockMovements = async () => {
  const result = await pool.query(`
    SELECT
      sm.id,
      sm.product_id,
      p.product_name,
      p.sku,
      sm.quantity,
      sm.movement_type,
      sm.reason,
      u.name AS created_by_name,
      sm.created_at
    FROM stock_movements sm
    INNER JOIN products p
      ON p.id = sm.product_id
    INNER JOIN users u
      ON u.id = sm.created_by
    ORDER BY sm.created_at DESC
    LIMIT 10
  `);

  return result.rows;
};

export const getDashboardLowStock = async () => {
  const result = await pool.query(`
    SELECT
      p.id,
      p.product_name,
      p.sku,
      p.current_stock,
      p.minimum_stock_quantity,
      w.name AS warehouse_name
    FROM products p
    INNER JOIN warehouses w
      ON w.id = p.warehouse_id
    WHERE
      p.is_active = true
      AND p.current_stock <= p.minimum_stock_quantity
    ORDER BY p.current_stock ASC, p.product_name ASC
  `);

  return result.rows;
};