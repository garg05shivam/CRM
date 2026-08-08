import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "../context/useAuth";

import {
  createStockMovement,
  getLowStockProducts,
  getStockMovements,
} from "../api/inventory";

import { getProducts } from "../api/products";

import type {
  LowStockProduct,
  StockMovement,
  StockMovementType,
} from "../types/inventory";

import type { Product } from "../types/product";

export const Inventory = () => {
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>(
    [],
  );

  const [movements, setMovements] = useState<
    StockMovement[]
  >([]);

  const [lowStock, setLowStock] = useState<
    LowStockProduct[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [movementType, setMovementType] =
    useState<StockMovementType>("IN");

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");

  const canManageStock =
    user?.role === "ADMIN" ||
    user?.role === "WAREHOUSE";

  const loadInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        productsResponse,
        movementsResponse,
        lowStockResponse,
      ] = await Promise.all([
        getProducts(),
        getStockMovements(),
        getLowStockProducts(),
      ]);

      setProducts(productsResponse.data);
      setMovements(movementsResponse.data);
      setLowStock(lowStockResponse.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load inventory",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadInventory();
    })();
  }, [loadInventory]);

  const handleMovement = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!productId) {
      setError("Please select a product.");
      return;
    }

    if (quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    if (!reason.trim()) {
      setError("Please enter a reason.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await createStockMovement({
        productId,
        quantity: Number(quantity),
        movementType,
        reason: reason.trim(),
      });

      setSuccess(
        `Stock ${movementType === "IN" ? "added" : "removed"} successfully.`,
      );

      setProductId("");
      setQuantity(1);
      setReason("");
      setMovementType("IN");

      await loadInventory();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create stock movement";

      if (
        message.toLowerCase().includes(
          "insufficient",
        )
      ) {
        setError(
          "Insufficient stock. You cannot remove more stock than is currently available.",
        );
      } else {
        setError(message);
      }
    } finally {
      setSaving(false);
    }
  };

  const selectedProduct = products.find(
    (product) => product.id === productId,
  );

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>Inventory</h1>
          <p>
            Manage stock movements and monitor
            inventory levels.
          </p>
        </div>
      </div>

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      {success && (
        <div className="page-success">
          {success}
        </div>
      )}

      {/* Stock Movement */}

      {canManageStock && (
        <form
          className="customer-form"
          onSubmit={handleMovement}
        >
          <h2>Stock Movement</h2>

          <div className="form-grid">
            <label>
              Movement Type *
              <select
                value={movementType}
                onChange={(event) =>
                  setMovementType(
                    event.target
                      .value as StockMovementType,
                  )
                }
              >
                <option value="IN">
                  Stock In
                </option>

                <option value="OUT">
                  Stock Out
                </option>
              </select>
            </label>

            <label>
              Product *
              <select
                required
                value={productId}
                onChange={(event) =>
                  setProductId(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  Select product
                </option>

                {products
                  .filter(
                    (product) =>
                      product.isActive,
                  )
                  .map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.productName} (
                      {product.sku}) — Stock:{" "}
                      {product.currentStock}
                    </option>
                  ))}
              </select>
            </label>

            <label>
              Quantity *
              <input
                type="number"
                min="1"
                step="1"
                required
                value={quantity}
                onChange={(event) =>
                  setQuantity(
                    Number(
                      event.target.value,
                    ),
                  )
                }
              />
            </label>

            <label>
              Reason *
              <input
                type="text"
                required
                maxLength={255}
                value={reason}
                onChange={(event) =>
                  setReason(
                    event.target.value,
                  )
                }
                placeholder="e.g. New purchase"
              />
            </label>
          </div>

          {selectedProduct && (
            <div className="inventory-preview">
              <strong>
                {selectedProduct.productName}
              </strong>

              <span>
                Current stock:{" "}
                {selectedProduct.currentStock}
              </span>

              {movementType === "OUT" && (
                <span>
                  Remaining after movement:{" "}
                  {Math.max(
                    0,
                    selectedProduct.currentStock -
                      quantity,
                  )}
                </span>
              )}
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : movementType === "IN"
                  ? "Add Stock"
                  : "Remove Stock"}
            </button>
          </div>
        </form>
      )}

      {/* Low Stock */}

      <div className="inventory-section">
        <div className="section-header">
          <div>
            <h2>Low Stock</h2>
            <p>
              Active products at or below their
              minimum stock level.
            </p>
          </div>

          <strong>
            {lowStock.length}
          </strong>
        </div>

        {lowStock.length === 0 ? (
          <div className="empty-state-box">
            No low-stock products.
          </div>
        ) : (
          <div className="customer-table-wrapper">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Minimum Stock</th>
                  <th>Warehouse</th>
                </tr>
              </thead>

              <tbody>
                {lowStock.map((product) => (
                  <tr key={product.id}>
                    <td>
                      {product.productName}
                    </td>

                    <td>{product.sku}</td>

                    <td>
                      {product.category}
                    </td>

                    <td>
                      <strong className="stock-low">
                        {product.currentStock}
                      </strong>
                    </td>

                    <td>
                      {
                        product.minimumStockQuantity
                      }
                    </td>

                    <td>
                      {product.warehouseName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Movement History */}

      <div className="inventory-section">
        <div className="section-header">
          <div>
            <h2>Movement History</h2>
            <p>
              Recent stock additions and removals.
            </p>
          </div>

          <strong>
            {movements.length}
          </strong>
        </div>

        {loading ? (
          <div className="page-message">
            Loading inventory...
          </div>
        ) : movements.length === 0 ? (
          <div className="empty-state-box">
            No stock movements yet.
          </div>
        ) : (
          <div className="customer-table-wrapper">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Reason</th>
                  <th>Created By</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id}>
                    <td>
                      {movement.productName}
                    </td>

                    <td>{movement.sku}</td>

                    <td>
                      <span
                        className={`status-badge ${
                          movement.movementType ===
                          "IN"
                            ? "status-active"
                            : "status-inactive"
                        }`}
                      >
                        {movement.movementType}
                      </span>
                    </td>

                    <td>
                      <strong>
                        {movement.movementType ===
                        "IN"
                          ? "+"
                          : "-"}
                        {movement.quantity}
                      </strong>
                    </td>

                    <td>
                      {movement.reason}
                    </td>

                    <td>
                      {
                        movement.createdByName
                      }
                    </td>

                    <td>
                      {new Date(
                        movement.createdAt,
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};