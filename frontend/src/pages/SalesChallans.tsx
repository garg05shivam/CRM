import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "../context/AuthContext";

import {
  cancelChallan,
  confirmChallan,
  createChallan,
  getChallan,
  getChallans,
} from "../api/challans";

import { getCustomers } from "../api/customers";
import { getProducts } from "../api/products";

import type { Customer } from "../types/customer";
import type { Product } from "../types/product";
import type {
  Challan,
  ChallanItemInput,
  ChallanStatus,
} from "../types/challan";

interface DraftItem extends ChallanItemInput {
  productName: string;
  sku: string;
  unitPrice: number;
}

export const SalesChallans = () => {
  const { user } = useAuth();

  const canManage =
    user?.role === "ADMIN" ||
    user?.role === "SALES";

  const [challans, setChallans] =
    useState<Challan[]>([]);

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [selectedCustomer, setSelectedCustomer] =
    useState("");

  const [selectedProduct, setSelectedProduct] =
    useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [items, setItems] =
    useState<DraftItem[]>([]);

  const [selectedChallan, setSelectedChallan] =
    useState<Challan | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const loadData = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const [
          challansResponse,
          customersResponse,
          productsResponse,
        ] = await Promise.all([
          getChallans(),
          getCustomers(),
          getProducts(),
        ]);

        setChallans(
          challansResponse.data,
        );

        setCustomers(
          customersResponse.data,
        );

        setProducts(
          productsResponse.data,
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load sales challans",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addItem = () => {
    setError("");

    if (!selectedProduct) {
      setError(
        "Please select a product.",
      );
      return;
    }

    if (quantity <= 0) {
      setError(
        "Quantity must be greater than zero.",
      );
      return;
    }

    const product = products.find(
      (item) =>
        item.id === selectedProduct,
    );

    if (!product) {
      setError(
        "Selected product was not found.",
      );
      return;
    }

    if (!product.isActive) {
      setError(
        "This product is inactive.",
      );
      return;
    }

    const alreadyAdded = items.some(
      (item) =>
        item.productId === selectedProduct,
    );

    if (alreadyAdded) {
      setError(
        "This product is already added to the challan.",
      );
      return;
    }

    setItems((current) => [
      ...current,
      {
        productId: product.id,
        productName:
          product.productName,
        sku: product.sku,
        unitPrice: product.unitPrice,
        quantity,
      },
    ]);

    setSelectedProduct("");
    setQuantity(1);
  };

  const removeItem = (
    productId: string,
  ) => {
    setItems((current) =>
      current.filter(
        (item) =>
          item.productId !== productId,
      ),
    );
  };

  const updateItemQuantity = (
    productId: string,
    newQuantity: number,
  ) => {
    if (newQuantity < 1) {
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: newQuantity,
            }
          : item,
      ),
    );
  };

  const handleCreate = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!selectedCustomer) {
      setError(
        "Please select a customer.",
      );
      return;
    }

    if (items.length === 0) {
      setError(
        "Add at least one product.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await createChallan({
        customerId:
          selectedCustomer,
        items: items.map((item) => ({
          productId:
            item.productId,
          quantity: item.quantity,
        })),
      });

      setSuccess(
        "Sales challan created successfully.",
      );

      setSelectedCustomer("");
      setSelectedProduct("");
      setQuantity(1);
      setItems([]);

      await loadData();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create challan",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleView = async (
    id: string,
  ) => {
    try {
      setError("");

      const response =
        await getChallan(id);

      setSelectedChallan(
        response.data,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load challan",
      );
    }
  };

  const handleConfirm = async (
    id: string,
  ) => {
    const confirmed =
      window.confirm(
        "Confirm this challan? Stock will be deducted.",
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await confirmChallan(id);

      setSuccess(
        "Sales challan confirmed successfully. Stock has been deducted.",
      );

      setSelectedChallan(null);

      await loadData();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to confirm challan";

      if (
        message
          .toLowerCase()
          .includes("insufficient")
      ) {
        setError(
          "Insufficient stock. The challan cannot be confirmed.",
        );
      } else {
        setError(message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (
    id: string,
  ) => {
    const confirmed =
      window.confirm(
        "Cancel this draft challan?",
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await cancelChallan(id);

      setSuccess(
        "Sales challan cancelled successfully.",
      );

      setSelectedChallan(null);

      await loadData();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to cancel challan",
      );
    } finally {
      setSaving(false);
    }
  };

  const getStatusClass = (
    status: ChallanStatus,
  ) => {
    if (status === "CONFIRMED") {
      return "status-active";
    }

    if (status === "CANCELLED") {
      return "status-inactive";
    }

    return "";
  };

  const totalQuantity =
    items.reduce(
      (total, item) =>
        total + item.quantity,
      0,
    );

  const totalAmount =
    items.reduce(
      (total, item) =>
        total +
        item.quantity *
          item.unitPrice,
      0,
    );

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>Sales Challans</h1>

          <p>
            Create, manage and confirm
            sales challans.
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

      {canManage && (
        <form
          className="customer-form"
          onSubmit={handleCreate}
        >
          <h2>Create Sales Challan</h2>

          <div className="form-grid">
            <label>
              Customer *
              <select
                required
                value={selectedCustomer}
                onChange={(event) =>
                  setSelectedCustomer(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  Select customer
                </option>

                {customers.map(
                  (customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {
                        customer.customerName
                      }{" "}
                      —{" "}
                      {
                        customer.businessName
                      }
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              Product *
              <select
                value={selectedProduct}
                onChange={(event) =>
                  setSelectedProduct(
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
                      {
                        product.productName
                      }{" "}
                      ({product.sku}) —
                      Stock:{" "}
                      {
                        product.currentStock
                      }
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

            <div className="form-field-button">
              <button
                type="button"
                className="secondary-button"
                onClick={addItem}
              >
                Add Product
              </button>
            </div>
          </div>

          {items.length > 0 && (
            <div className="challan-items">
              <h3>Items</h3>

              <div className="customer-table-wrapper">
                <table className="customer-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Unit Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map(
                      (item) => (
                        <tr
                          key={
                            item.productId
                          }
                        >
                          <td>
                            {
                              item.productName
                            }
                          </td>

                          <td>
                            {item.sku}
                          </td>

                          <td>
                            ₹
                            {Number(
                              item.unitPrice,
                            ).toFixed(2)}
                          </td>

                          <td>
                            <input
                              className="quantity-input"
                              type="number"
                              min="1"
                              value={
                                item.quantity
                              }
                              onChange={(
                                event,
                              ) =>
                                updateItemQuantity(
                                  item.productId,
                                  Number(
                                    event
                                      .target
                                      .value,
                                  ),
                                )
                              }
                            />
                          </td>

                          <td>
                            ₹
                            {(
                              item.unitPrice *
                              item.quantity
                            ).toFixed(2)}
                          </td>

                          <td>
                            <button
                              type="button"
                              className="danger-button"
                              onClick={() =>
                                removeItem(
                                  item.productId,
                                )
                              }
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <div className="challan-summary">
                <strong>
                  Total Quantity:{" "}
                  {totalQuantity}
                </strong>

                <strong>
                  Total Value: ₹
                  {totalAmount.toFixed(
                    2,
                  )}
                </strong>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={
                saving ||
                items.length === 0
              }
            >
              {saving
                ? "Creating..."
                : "Create Draft Challan"}
            </button>
          </div>
        </form>
      )}

      <div className="inventory-section">
        <div className="section-header">
          <div>
            <h2>Challans</h2>

            <p>
              View and manage sales
              challans.
            </p>
          </div>

          <strong>
            {challans.length}
          </strong>
        </div>

        {loading ? (
          <div className="page-message">
            Loading challans...
          </div>
        ) : challans.length === 0 ? (
          <div className="empty-state-box">
            No sales challans found.
          </div>
        ) : (
          <div className="customer-table-wrapper">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Challan</th>
                  <th>Customer</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {challans.map(
                  (challan) => (
                    <tr
                      key={challan.id}
                    >
                      <td>
                        <strong>
                          {
                            challan.challanNumber
                          }
                        </strong>
                      </td>

                      <td>
                        {
                          challan.customerName
                        }
                      </td>

                      <td>
                        {
                          challan.totalQuantity
                        }
                      </td>

                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            challan.status,
                          )}`}
                        >
                          {
                            challan.status
                          }
                        </span>
                      </td>

                      <td>
                        {
                          challan.createdByName
                        }
                      </td>

                      <td>
                        {new Date(
                          challan.createdAt,
                        ).toLocaleString()}
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              handleView(
                                challan.id,
                              )
                            }
                          >
                            View
                          </button>

                          {canManage &&
                            challan.status ===
                              "DRAFT" && (
                              <>
                                <button
                                  type="button"
                                  className="primary-button"
                                  disabled={
                                    saving
                                  }
                                  onClick={() =>
                                    handleConfirm(
                                      challan.id,
                                    )
                                  }
                                >
                                  Confirm
                                </button>

                                <button
                                  type="button"
                                  className="danger-button"
                                  disabled={
                                    saving
                                  }
                                  onClick={() =>
                                    handleCancel(
                                      challan.id,
                                    )
                                  }
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedChallan && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h2>
                  {
                    selectedChallan.challanNumber
                  }
                </h2>

                <p>
                  {
                    selectedChallan.customerName
                  }
                </p>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={() =>
                  setSelectedChallan(
                    null,
                  )
                }
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="detail-grid">
                <div>
                  <span>Status</span>

                  <strong>
                    {
                      selectedChallan.status
                    }
                  </strong>
                </div>

                <div>
                  <span>Total Quantity</span>

                  <strong>
                    {
                      selectedChallan.totalQuantity
                    }
                  </strong>
                </div>

                <div>
                  <span>Created By</span>

                  <strong>
                    {
                      selectedChallan.createdByName
                    }
                  </strong>
                </div>

                <div>
                  <span>Created</span>

                  <strong>
                    {new Date(
                      selectedChallan.createdAt,
                    ).toLocaleString()}
                  </strong>
                </div>
              </div>

              <h3>Products</h3>

              <div className="customer-table-wrapper">
                <table className="customer-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Unit Price</th>
                      <th>Quantity</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedChallan.items?.map(
                      (item) => (
                        <tr
                          key={item.id}
                        >
                          <td>
                            {
                              item.productNameSnapshot
                            }
                          </td>

                          <td>
                            {
                              item.skuSnapshot
                            }
                          </td>

                          <td>
                            ₹
                            {Number(
                              item.unitPriceSnapshot,
                            ).toFixed(
                              2,
                            )}
                          </td>

                          <td>
                            {item.quantity}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-actions">
              {canManage &&
                selectedChallan.status ===
                  "DRAFT" && (
                  <>
                    <button
                      type="button"
                      className="primary-button"
                      disabled={saving}
                      onClick={() =>
                        handleConfirm(
                          selectedChallan.id,
                        )
                      }
                    >
                      Confirm Challan
                    </button>

                    <button
                      type="button"
                      className="danger-button"
                      disabled={saving}
                      onClick={() =>
                        handleCancel(
                          selectedChallan.id,
                        )
                      }
                    >
                      Cancel Challan
                    </button>
                  </>
                )}

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setSelectedChallan(
                    null,
                  )
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};