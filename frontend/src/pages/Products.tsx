import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "../context/AuthContext";

import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "../api/products";

import { getWarehouses } from "../api/warehouses";

import type {
  Product,
  ProductInput,
} from "../types/product";

import type { Warehouse } from "../types/warehouse";

export const Products = () => {
  const { user } = useAuth();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [warehouses, setWarehouses] =
    useState<Warehouse[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [showDetails, setShowDetails] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [form, setForm] =
    useState<ProductInput>({
      productName: "",
      sku: "",
      category: "",
      unitPrice: 0,
      minimumStockQuantity: 0,
      warehouseId: "",
    });

  const loadProducts = useCallback(
    async (value?: string) => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getProducts(value);

        setProducts(response.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load products",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const loadWarehouses =
    useCallback(async () => {
      try {
        const response =
          await getWarehouses();

        setWarehouses(
          response.data.filter(
            (warehouse) =>
              warehouse.isActive,
          ),
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load warehouses",
        );
      }
    }, []);

  useEffect(() => {
    loadProducts();
    loadWarehouses();
  }, [
    loadProducts,
    loadWarehouses,
  ]);

  const handleSearch = (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    loadProducts(search);
  };

  const handleChange = (
    field: keyof ProductInput,
    value: string | number,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      productName: "",
      sku: "",
      category: "",
      unitPrice: 0,
      minimumStockQuantity: 0,
      warehouseId: "",
    });

    setFormError("");
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleCreate = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setFormError("");

      await createProduct({
        ...form,
        unitPrice: Number(
          form.unitPrice,
        ),
        minimumStockQuantity: Number(
          form.minimumStockQuantity ?? 0,
        ),
      });

      resetForm();

      await loadProducts(search);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to create product",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleView = async (
    productId: string,
  ) => {
    try {
      setError("");

      const response =
        await getProduct(productId);

      setSelectedProduct(response.data);
      setShowDetails(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load product",
      );
    }
  };

  const handleEdit = (
    product: Product,
  ) => {
    setEditingProduct(product);

    setForm({
      productName: product.productName,
      sku: product.sku,
      category: product.category,
      unitPrice: Number(
        product.unitPrice,
      ),
      minimumStockQuantity:
        Number(
          product.minimumStockQuantity,
        ),
      warehouseId:
        product.warehouseId,
    });

    setFormError("");
    setShowDetails(false);
    setShowForm(true);
  };

  const handleUpdate = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!editingProduct) {
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      await updateProduct(
        editingProduct.id,
        {
          productName:
            form.productName,
          sku: form.sku,
          category: form.category,
          unitPrice: Number(
            form.unitPrice,
          ),
          minimumStockQuantity:
            Number(
              form.minimumStockQuantity ?? 0,
            ),
          warehouseId:
            form.warehouseId,
        },
      );

      resetForm();

      await loadProducts(search);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to update product",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive =
    async (
      product: Product,
    ) => {
      try {
        setError("");

        await updateProduct(
          product.id,
          {
            isActive:
              !product.isActive,
          },
        );

        await loadProducts(search);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to update product status",
        );
      }
    };

  const handleDelete = async (
    product: Product,
  ) => {
    const confirmed =
      window.confirm(
        `Delete product "${product.productName}"? This action cannot be undone.`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteProduct(
        product.id,
      );

      await loadProducts(search);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete product",
      );
    }
  };

  const canManageProducts =
    user?.role === "ADMIN" ||
    user?.role === "WAREHOUSE";

  const canDeleteProducts =
    user?.role === "ADMIN";

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>Products</h1>

          <p>
            Manage products and stock
            settings
          </p>
        </div>

        {canManageProducts && (
          <button
            className="primary-button"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setEditingProduct(null);

                setForm({
                  productName: "",
                  sku: "",
                  category: "",
                  unitPrice: 0,
                  minimumStockQuantity: 0,
                  warehouseId: "",
                });

                setFormError("");
                setShowForm(true);
              }
            }}
          >
            {showForm
              ? "Close"
              : "Add Product"}
          </button>
        )}
      </div>

      {/* Product Form */}

      {showForm &&
        canManageProducts && (
          <form
            className="customer-form"
            onSubmit={
              editingProduct
                ? handleUpdate
                : handleCreate
            }
          >
            <h2>
              {editingProduct
                ? "Edit Product"
                : "Add Product"}
            </h2>

            {formError && (
              <div className="page-error">
                {formError}
              </div>
            )}

            <div className="form-grid">
              <label>
                Product Name *
                <input
                  required
                  minLength={2}
                  value={
                    form.productName
                  }
                  onChange={(event) =>
                    handleChange(
                      "productName",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                SKU *
                <input
                  required
                  value={form.sku}
                  onChange={(event) =>
                    handleChange(
                      "sku",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                Category *
                <input
                  required
                  value={form.category}
                  onChange={(event) =>
                    handleChange(
                      "category",
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                Unit Price *
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    form.unitPrice
                  }
                  onChange={(event) =>
                    handleChange(
                      "unitPrice",
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                />
              </label>

              <label>
                Minimum Stock
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={
                    form.minimumStockQuantity ??
                    0
                  }
                  onChange={(event) =>
                    handleChange(
                      "minimumStockQuantity",
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                />
              </label>

              <label>
                Warehouse *
                <select
                  required
                  value={
                    form.warehouseId
                  }
                  onChange={(event) =>
                    handleChange(
                      "warehouseId",
                      event.target.value,
                    )
                  }
                >
                  <option value="">
                    Select warehouse
                  </option>

                  {warehouses.map(
                    (warehouse) => (
                      <option
                        key={
                          warehouse.id
                        }
                        value={
                          warehouse.id
                        }
                      >
                        {warehouse.name} —{" "}
                        {
                          warehouse.location
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingProduct
                    ? "Save Changes"
                    : "Create Product"}
              </button>
            </div>
          </form>
        )}

      {/* Search */}

      <form
        className="customer-search"
        onSubmit={handleSearch}
      >
        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value,
            )
          }
          placeholder="Search by product, SKU or category"
        />

        <button type="submit">
          Search
        </button>
      </form>

      {/* Loading */}

      {loading && (
        <div className="page-message">
          Loading products...
        </div>
      )}

      {/* Error */}

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      {/* Product Table */}

      {!loading && !error && (
        <div className="customer-table-wrapper">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Min Stock</th>
                <th>Warehouse</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="empty-state"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map(
                  (product) => (
                    <tr
                      key={
                        product.id
                      }
                    >
                      <td>
                        {
                          product.productName
                        }
                      </td>

                      <td>
                        {product.sku}
                      </td>

                      <td>
                        {
                          product.category
                        }
                      </td>

                      <td>
                        ₹
                        {Number(
                          product.unitPrice,
                        ).toFixed(2)}
                      </td>

                      <td>
                        <strong
                          className={
                            product.currentStock <=
                            product.minimumStockQuantity
                              ? "stock-low"
                              : ""
                          }
                        >
                          {
                            product.currentStock
                          }
                        </strong>
                      </td>

                      <td>
                        {
                          product.minimumStockQuantity
                        }
                      </td>

                      <td>
                        {
                          product.warehouseName
                        }
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            product.isActive
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          {product.isActive
                            ? "ACTIVE"
                            : "INACTIVE"}
                        </span>
                      </td>

                      <td>
                        <div className="customer-actions">
                          <button
                            type="button"
                            className="table-button"
                            onClick={() =>
                              handleView(
                                product.id,
                              )
                            }
                          >
                            View
                          </button>

                          {canManageProducts && (
                            <button
                              type="button"
                              className="table-button"
                              onClick={() =>
                                handleEdit(
                                  product,
                                )
                              }
                            >
                              Edit
                            </button>
                          )}

                          {canManageProducts && (
                            <button
                              type="button"
                              className="table-button"
                              onClick={() =>
                                handleToggleActive(
                                  product,
                                )
                              }
                            >
                              {product.isActive
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          )}

                          {canDeleteProducts && (
                            <button
                              type="button"
                              className="table-button table-button-danger"
                              onClick={() =>
                                handleDelete(
                                  product,
                                )
                              }
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Details */}

      {showDetails &&
        selectedProduct && (
          <div className="customer-modal-backdrop">
            <div className="customer-modal">
              <div className="customer-modal-header">
                <div>
                  <h2>
                    {
                      selectedProduct.productName
                    }
                  </h2>

                  <p>
                    SKU:{" "}
                    {
                      selectedProduct.sku
                    }
                  </p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={() => {
                    setShowDetails(
                      false,
                    );
                    setSelectedProduct(
                      null,
                    );
                  }}
                >
                  ×
                </button>
              </div>

              <div className="customer-details-grid">
                <div>
                  <span>
                    Product Name
                  </span>

                  <strong>
                    {
                      selectedProduct.productName
                    }
                  </strong>
                </div>

                <div>
                  <span>SKU</span>

                  <strong>
                    {
                      selectedProduct.sku
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Category
                  </span>

                  <strong>
                    {
                      selectedProduct.category
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Unit Price
                  </span>

                  <strong>
                    ₹
                    {Number(
                      selectedProduct.unitPrice,
                    ).toFixed(2)}
                  </strong>
                </div>

                <div>
                  <span>
                    Current Stock
                  </span>

                  <strong>
                    {
                      selectedProduct.currentStock
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Minimum Stock
                  </span>

                  <strong>
                    {
                      selectedProduct.minimumStockQuantity
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Warehouse
                  </span>

                  <strong>
                    {
                      selectedProduct.warehouseName
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Warehouse Location
                  </span>

                  <strong>
                    {
                      selectedProduct.warehouseLocation ||
                      "-"
                    }
                  </strong>
                </div>

                <div>
                  <span>Status</span>

                  <strong>
                    {selectedProduct.isActive
                      ? "ACTIVE"
                      : "INACTIVE"}
                  </strong>
                </div>
              </div>

              <div className="form-actions">
                {canManageProducts && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      handleEdit(
                        selectedProduct,
                      )
                    }
                  >
                    Edit Product
                  </button>
                )}

                {canDeleteProducts && (
                  <button
                    type="button"
                    className="table-button table-button-danger"
                    onClick={async () => {
                      await handleDelete(
                        selectedProduct,
                      );

                      setShowDetails(
                        false,
                      );

                      setSelectedProduct(
                        null,
                      );
                    }}
                  >
                    Delete Product
                  </button>
                )}

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setShowDetails(
                      false,
                    );
                    setSelectedProduct(
                      null,
                    );
                  }}
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