import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "../context/useAuth";

import {
  createWarehouse,
  deleteWarehouse,
  getWarehouses,
  updateWarehouse,
} from "../api/warehouses";

import type {
  Warehouse,
} from "../types/warehouse";

interface WarehouseForm {
  name: string;
  location: string;
}

const emptyForm: WarehouseForm = {
  name: "",
  location: "",
};

export const Warehouses = () => {
  const { user } = useAuth();

  const [warehouses, setWarehouses] =
    useState<Warehouse[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [form, setForm] =
    useState<WarehouseForm>(
      emptyForm,
    );

  const [editingWarehouse, setEditingWarehouse] =
    useState<Warehouse | null>(null);

  const loadWarehouses =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getWarehouses();

        setWarehouses(response.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load warehouses",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    (async () => {
      await loadWarehouses();
    })();
  }, [loadWarehouses]);

  const handleCreate = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await createWarehouse({
        name: form.name.trim(),
        location: form.location.trim(),
      });

      setForm(emptyForm);

      setSuccess(
        "Warehouse created successfully.",
      );

      await loadWarehouses();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create warehouse",
      );
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (
    warehouse: Warehouse,
  ) => {
    setError("");
    setSuccess("");

    setEditingWarehouse(
      warehouse,
    );

    setForm({
      name: warehouse.name,
      location: warehouse.location,
    });
  };

  const handleUpdate = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!editingWarehouse) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateWarehouse(
        editingWarehouse.id,
        {
          name: form.name.trim(),
          location:
            form.location.trim(),
        },
      );

      setEditingWarehouse(null);
      setForm(emptyForm);

      setSuccess(
        "Warehouse updated successfully.",
      );

      await loadWarehouses();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update warehouse",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (
    warehouse: Warehouse,
  ) => {
    if (user?.role !== "ADMIN") {
      return;
    }

    const isActive =
      warehouse.isActive ??
      warehouse.is_active ??
      false;

    const action =
      isActive
        ? "deactivate"
        : "activate";

    const confirmed =
      window.confirm(
        `Are you sure you want to ${action} "${warehouse.name}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateWarehouse(
        warehouse.id,
        {
          isActive:
            !isActive,
        },
      );

      setSuccess(
        `Warehouse ${action}d successfully.`,
      );

      await loadWarehouses();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : `Failed to ${action} warehouse`,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    warehouse: Warehouse,
  ) => {
    if (user?.role !== "ADMIN") {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${warehouse.name}"? This cannot be undone.`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await deleteWarehouse(
        warehouse.id,
      );

      setSuccess(
        "Warehouse deleted successfully.",
      );

      await loadWarehouses();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete warehouse",
      );
    } finally {
      setSaving(false);
    }
  };

  const isAdmin =
    user?.role === "ADMIN";

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>Warehouses</h1>

          <p>
            Manage your CRM warehouses
            and locations.
          </p>
        </div>

        <strong>
          {warehouses.length} Warehouses
        </strong>
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

      {isAdmin && (
        <form
          className="customer-form"
          onSubmit={
            editingWarehouse
              ? handleUpdate
              : handleCreate
          }
        >
          <h2>
            {editingWarehouse
              ? "Edit Warehouse"
              : "Create Warehouse"}
          </h2>

          <div className="form-grid">
            <label>
              Warehouse Name *
              <input
                type="text"
                required
                minLength={2}
                maxLength={150}
                value={form.name}
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      name:
                        event.target
                          .value,
                    }),
                  )
                }
                placeholder="Main Warehouse"
              />
            </label>

            <label>
              Location *
              <input
                type="text"
                required
                minLength={2}
                value={
                  form.location
                }
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      location:
                        event.target
                          .value,
                    }),
                  )
                }
                placeholder="Mumbai"
              />
            </label>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingWarehouse
                  ? "Update Warehouse"
                  : "Create Warehouse"}
            </button>

            {editingWarehouse && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setEditingWarehouse(
                    null,
                  );
                  setForm(
                    emptyForm,
                  );
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="inventory-section">
        <div className="section-header">
          <div>
            <h2>
              Warehouse List
            </h2>

            <p>
              {isAdmin
                ? "Create, edit and manage warehouse status."
                : "View available warehouses."}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="page-message">
            Loading warehouses...
          </div>
        ) : warehouses.length === 0 ? (
          <div className="empty-state-box">
            No warehouses found.
          </div>
        ) : (
          <div className="customer-table-wrapper">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Created</th>

                  {isAdmin && (
                    <th>
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {warehouses.map(
                  (warehouse) => {
                    const isActive =
                      warehouse.isActive ??
                      warehouse.is_active ??
                      false;

                    const rawDate =
                      warehouse.createdAt ||
                      warehouse.created_at;

                    const formattedDate =
                      rawDate &&
                      !isNaN(
                        new Date(rawDate).getTime(),
                      )
                        ? new Date(
                            rawDate,
                          ).toLocaleDateString()
                        : "N/A";

                    return (
                      <tr
                        key={
                          warehouse.id
                        }
                      >
                        <td>
                          <strong>
                            {
                              warehouse.name
                            }
                          </strong>
                        </td>

                        <td>
                          {
                            warehouse.location
                          }
                        </td>

                        <td>
                          <span
                            className={`status-badge ${
                              isActive
                                ? "status-active"
                                : "status-inactive"
                            }`}
                          >
                            {isActive
                              ? "ACTIVE"
                              : "INACTIVE"}
                          </span>
                        </td>

                        <td>
                          {formattedDate}
                        </td>

                        {isAdmin && (
                          <td>
                            <div className="table-actions">
                              <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                  openEdit(
                                    warehouse,
                                  )
                                }
                                disabled={
                                  saving
                                }
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className={
                                  isActive
                                    ? "danger-button"
                                    : "primary-button"
                                }
                                onClick={() =>
                                  handleToggleStatus(
                                    warehouse,
                                  )
                                }
                                disabled={
                                  saving
                                }
                              >
                                {isActive
                                  ? "Disable"
                                  : "Enable"}
                              </button>

                              <button
                                type="button"
                                className="danger-button"
                                onClick={() =>
                                  handleDelete(
                                    warehouse,
                                  )
                                }
                                disabled={
                                  saving
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};