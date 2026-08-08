import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "../context/AuthContext";

import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  getCustomers,
  updateCustomer,
} from "../api/customers";

import type {
  Customer,
  CustomerInput,
  CustomerType,
  CustomerStatus,
} from "../types/customer";
import {
  createFollowUp,
  deleteFollowUp,
  getCustomerFollowUps,
  updateFollowUp,
} from "../api/followUps";
import type {
  FollowUp,
  FollowUpInput,
} from "../types/followUp";

const CUSTOMER_TYPES: CustomerType[] = [
  "RETAIL",
  "WHOLESALE",
  "DISTRIBUTOR",
];

const CUSTOMER_STATUSES: CustomerStatus[] = [
  "LEAD",
  "ACTIVE",
  "INACTIVE",
];

const emptyForm: CustomerInput = {
  customerName: "",
  mobileNumber: "",
  email: "",
  businessName: "",
  gstNumber: "",
  customerType: "RETAIL",
  address: "",
  status: "LEAD",
  followUpDate: "",
  notes: "",
};

export const Customers = () => {
  const { user } = useAuth();

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [form, setForm] =
    useState<CustomerInput>(emptyForm);

  const [saving, setSaving] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [showDetails, setShowDetails] =
    useState(false);

  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  const [followUps, setFollowUps] =
    useState<FollowUp[]>([]);

  const [followUpsLoading, setFollowUpsLoading] =
    useState(false);

  const [followUpError, setFollowUpError] =
    useState("");

  const [showFollowUpForm, setShowFollowUpForm] =
    useState(false);

  const [editingFollowUp, setEditingFollowUp] =
    useState<FollowUp | null>(null);

  const [followUpForm, setFollowUpForm] =
    useState<FollowUpInput>({
      note: "",
      followUpDate: "",
    });

  const [savingFollowUp, setSavingFollowUp] =
    useState(false);

  const loadCustomers = useCallback(
    async (value?: string) => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getCustomers(value);

        setCustomers(response.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load customers",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleSearch = (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    loadCustomers(search);
  };

  const handleChange = (
    field: keyof CustomerInput,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setFormError("");
    setShowForm(false);
    setEditingCustomer(null);
  };

  const handleCreate = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setFormError("");

      await createCustomer({
        ...form,
        email: form.email || undefined,
        gstNumber:
          form.gstNumber || undefined,
        followUpDate:
          form.followUpDate || undefined,
        notes: form.notes || undefined,
      });

      resetForm();

      await loadCustomers(search);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to create customer",
      );
    } finally {
      setSaving(false);
    }
  };

  const loadFollowUps = async (
    customerId: string,
  ) => {
    try {
      setFollowUpsLoading(true);
      setFollowUpError("");

      const response =
        await getCustomerFollowUps(customerId);

      setFollowUps(response.data);
    } catch (error) {
      setFollowUpError(
        error instanceof Error
          ? error.message
          : "Failed to load follow-ups",
      );
    } finally {
      setFollowUpsLoading(false);
    }
  };

  const handleView = async (
    customerId: string,
  ) => {
    try {
      setError("");

      const response =
        await getCustomer(customerId);

      setSelectedCustomer(response.data);
      setShowDetails(true);

      await loadFollowUps(customerId);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load customer",
      );
    }
  };

  const handleEdit = (
    customer: Customer,
  ) => {
    setEditingCustomer(customer);

    setForm({
      customerName: customer.customerName,
      mobileNumber: customer.mobileNumber,
      email: customer.email ?? "",
      businessName: customer.businessName,
      gstNumber: customer.gstNumber ?? "",
      customerType: customer.customerType,
      address: customer.address,
      status: customer.status,
      followUpDate:
        customer.followUpDate ?? "",
      notes: customer.notes ?? "",
    });

    setFormError("");
    setShowDetails(false);
    setShowForm(true);
  };

  const handleUpdate = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!editingCustomer) {
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      await updateCustomer(
        editingCustomer.id,
        {
          ...form,
          email: form.email || undefined,
          gstNumber:
            form.gstNumber || undefined,
          followUpDate:
            form.followUpDate || undefined,
          notes: form.notes || undefined,
        },
      );

      resetForm();

      await loadCustomers(search);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to update customer",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    customer: Customer,
  ) => {
    const confirmed = window.confirm(
      `Delete customer "${customer.customerName}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteCustomer(customer.id);

      await loadCustomers(search);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete customer",
      );
    }
  };

  const resetFollowUpForm = () => {
    setFollowUpForm({
      note: "",
      followUpDate: "",
    });

    setEditingFollowUp(null);
    setShowFollowUpForm(false);
    setFollowUpError("");
  };

  const handleFollowUpChange = (
    field: keyof FollowUpInput,
    value: string,
  ) => {
    setFollowUpForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleCreateFollowUp = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!selectedCustomer) {
      return;
    }

    try {
      setSavingFollowUp(true);
      setFollowUpError("");

      await createFollowUp(
        selectedCustomer.id,
        followUpForm,
      );

      resetFollowUpForm();

      await loadFollowUps(
        selectedCustomer.id,
      );
    } catch (error) {
      setFollowUpError(
        error instanceof Error
          ? error.message
          : "Failed to create follow-up",
      );
    } finally {
      setSavingFollowUp(false);
    }
  };

  const handleEditFollowUp = (
    followUp: FollowUp,
  ) => {
    setEditingFollowUp(followUp);

    setFollowUpForm({
      note: followUp.note,
      followUpDate: followUp.followUpDate,
    });

    setFollowUpError("");
    setShowFollowUpForm(true);
  };

  const handleUpdateFollowUp = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!editingFollowUp || !selectedCustomer) {
      return;
    }

    try {
      setSavingFollowUp(true);
      setFollowUpError("");

      await updateFollowUp(
        editingFollowUp.id,
        followUpForm,
      );

      resetFollowUpForm();

      await loadFollowUps(
        selectedCustomer.id,
      );
    } catch (error) {
      setFollowUpError(
        error instanceof Error
          ? error.message
          : "Failed to update follow-up",
      );
    } finally {
      setSavingFollowUp(false);
    }
  };

  const handleDeleteFollowUp = async (
    followUp: FollowUp,
  ) => {
    const confirmed = window.confirm(
      "Delete this follow-up? This action cannot be undone.",
    );

    if (!confirmed || !selectedCustomer) {
      return;
    }

    try {
      setFollowUpError("");

      await deleteFollowUp(followUp.id);

      await loadFollowUps(
        selectedCustomer.id,
      );
    } catch (error) {
      setFollowUpError(
        error instanceof Error
          ? error.message
          : "Failed to delete follow-up",
      );
    }
  };

  return (
    <div className="customers-page">
      <div className="page-header">
        <div>
          <h1>Customers</h1>

          <p>
            Manage your CRM customers
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setEditingCustomer(null);
              setForm(emptyForm);
              setFormError("");
              setShowForm(true);
            }
          }}
        >
          {showForm
            ? "Close"
            : "Add Customer"}
        </button>
      </div>

      {/* Create / Edit Form */}

      {showForm && (
        <form
          className="customer-form"
          onSubmit={
            editingCustomer
              ? handleUpdate
              : handleCreate
          }
        >
          <h2>
            {editingCustomer
              ? "Edit Customer"
              : "Add Customer"}
          </h2>

          {formError && (
            <div className="page-error">
              {formError}
            </div>
          )}

          <div className="form-grid">
            <label>
              Customer Name *
              <input
                required
                value={form.customerName}
                onChange={(event) =>
                  handleChange(
                    "customerName",
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Mobile Number *
              <input
                required
                value={form.mobileNumber}
                onChange={(event) =>
                  handleChange(
                    "mobileNumber",
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={form.email ?? ""}
                onChange={(event) =>
                  handleChange(
                    "email",
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Business Name *
              <input
                required
                value={form.businessName}
                onChange={(event) =>
                  handleChange(
                    "businessName",
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              GST Number
              <input
                value={form.gstNumber ?? ""}
                onChange={(event) =>
                  handleChange(
                    "gstNumber",
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Customer Type *
              <select
                value={form.customerType}
                onChange={(event) =>
                  handleChange(
                    "customerType",
                    event.target.value,
                  )
                }
              >
                {CUSTOMER_TYPES.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              Status
              <select
                value={form.status}
                onChange={(event) =>
                  handleChange(
                    "status",
                    event.target.value,
                  )
                }
              >
                {CUSTOMER_STATUSES.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              Follow-up Date
              <input
                type="date"
                value={
                  form.followUpDate ?? ""
                }
                onChange={(event) =>
                  handleChange(
                    "followUpDate",
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="form-full">
              Address *
              <textarea
                required
                value={form.address}
                onChange={(event) =>
                  handleChange(
                    "address",
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="form-full">
              Notes
              <textarea
                value={form.notes ?? ""}
                onChange={(event) =>
                  handleChange(
                    "notes",
                    event.target.value,
                  )
                }
              />
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
                : editingCustomer
                  ? "Save Changes"
                  : "Create Customer"}
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
            setSearch(event.target.value)
          }
          placeholder="Search by name, mobile, business or email"
        />

        <button type="submit">
          Search
        </button>
      </form>

      {/* Loading */}

      {loading && (
        <div className="page-message">
          Loading customers...
        </div>
      )}

      {/* Error */}

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      {/* Customer Table */}

      {!loading && !error && (
        <div className="customer-table-wrapper">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Business</th>
                <th>Type</th>
                <th>Status</th>
                <th>Follow-up</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="empty-state"
                  >
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map(
                  (customer) => (
                    <tr key={customer.id}>
                      <td>
                        {customer.customerName}
                      </td>

                      <td>
                        {customer.mobileNumber}
                      </td>

                      <td>
                        {customer.businessName}
                      </td>

                      <td>
                        {customer.customerType}
                      </td>

                      <td>
                        <span
                          className={`status-badge status-${customer.status.toLowerCase()}`}
                        >
                          {customer.status}
                        </span>
                      </td>

                      <td>
                        {customer.followUpDate ||
                          "-"}
                      </td>

                      <td>
                        <div className="customer-actions">
                          <button
                            type="button"
                            className="table-button"
                            onClick={() =>
                              handleView(
                                customer.id,
                              )
                            }
                          >
                            View
                          </button>

                          <button
                            type="button"
                            className="table-button"
                            onClick={() =>
                              handleEdit(
                                customer,
                              )
                            }
                          >
                            Edit
                          </button>

                          {user?.role ===
                            "ADMIN" && (
                            <button
                              type="button"
                              className="table-button table-button-danger"
                              onClick={() =>
                                handleDelete(
                                  customer,
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

      {/* Customer Details Modal */}

      {showDetails &&
        selectedCustomer && (
          <div className="customer-modal-backdrop">
            <div className="customer-modal">
              <div className="customer-modal-header">
                <div>
                  <h2>
                    {
                      selectedCustomer.customerName
                    }
                  </h2>

                  <p>
                    {
                      selectedCustomer.businessName
                    }
                  </p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedCustomer(null);
                  }}
                >
                  ×
                </button>
              </div>

              <div className="customer-details-grid">
                <div>
                  <span>Mobile</span>

                  <strong>
                    {
                      selectedCustomer.mobileNumber
                    }
                  </strong>
                </div>

                <div>
                  <span>Email</span>

                  <strong>
                    {selectedCustomer.email ||
                      "-"}
                  </strong>
                </div>

                <div>
                  <span>Customer Type</span>

                  <strong>
                    {
                      selectedCustomer.customerType
                    }
                  </strong>
                </div>

                <div>
                  <span>Status</span>

                  <strong>
                    {selectedCustomer.status}
                  </strong>
                </div>

                <div>
                  <span>GST Number</span>

                  <strong>
                    {selectedCustomer.gstNumber ||
                      "-"}
                  </strong>
                </div>

                <div>
                  <span>Follow-up Date</span>

                  <strong>
                    {
                      selectedCustomer.followUpDate ||
                      "-"
                    }
                  </strong>
                </div>

                <div className="details-full">
                  <span>Address</span>

                  <strong>
                    {selectedCustomer.address}
                  </strong>
                </div>

                <div className="details-full">
                  <span>Notes</span>

                  <strong>
                    {selectedCustomer.notes ||
                      "-"}
                  </strong>
                </div>
              </div>

              <div className="customer-followups">
                <div className="followups-header">
                  <div>
                    <h3>Follow-ups</h3>
                    <p>
                      Customer follow-up history
                    </p>
                  </div>

                  {(user?.role === "ADMIN" ||
                    user?.role === "SALES") && (
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => {
                        setEditingFollowUp(null);
                        setFollowUpForm({
                          note: "",
                          followUpDate: "",
                        });
                        setFollowUpError("");
                        setShowFollowUpForm(true);
                      }}
                    >
                      + Add Follow-up
                    </button>
                  )}
                </div>

                {followUpError && (
                  <div className="page-error">
                    {followUpError}
                  </div>
                )}

                {followUpsLoading ? (
                  <div className="page-message">
                    Loading follow-ups...
                  </div>
                ) : followUps.length === 0 ? (
                  <div className="empty-state">
                    No follow-ups found.
                  </div>
                ) : (
                  <div className="followup-list">
                    {followUps.map((followUp) => (
                      <div
                        key={followUp.id}
                        className="followup-card"
                      >
                        <div>
                          <strong>
                            {followUp.followUpDate}
                          </strong>
                          <p>{followUp.note}</p>
                        </div>

                        <div className="customer-actions">
                          {(user?.role === "ADMIN" ||
                            user?.role === "SALES") && (
                            <button
                              type="button"
                              className="table-button"
                              onClick={() =>
                                handleEditFollowUp(
                                  followUp,
                                )
                              }
                            >
                              Edit
                            </button>
                          )}

                          {user?.role === "ADMIN" && (
                            <button
                              type="button"
                              className="table-button table-button-danger"
                              onClick={() =>
                                handleDeleteFollowUp(
                                  followUp,
                                )
                              }
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showFollowUpForm && (
                  <form
                    className="followup-form"
                    onSubmit={
                      editingFollowUp
                        ? handleUpdateFollowUp
                        : handleCreateFollowUp
                    }
                  >
                    <h3>
                      {editingFollowUp
                        ? "Edit Follow-up"
                        : "Add Follow-up"}
                    </h3>

                    <label>
                      Follow-up Date *
                      <input
                        type="date"
                        required
                        value={
                          followUpForm.followUpDate
                        }
                        onChange={(event) =>
                          handleFollowUpChange(
                            "followUpDate",
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <label>
                      Note *
                      <textarea
                        required
                        value={followUpForm.note}
                        onChange={(event) =>
                          handleFollowUpChange(
                            "note",
                            event.target.value,
                          )
                        }
                        placeholder="Enter follow-up note"
                      />
                    </label>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={resetFollowUpForm}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="primary-button"
                        disabled={savingFollowUp}
                      >
                        {savingFollowUp
                          ? "Saving..."
                          : editingFollowUp
                            ? "Save Changes"
                            : "Create Follow-up"}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    handleEdit(
                      selectedCustomer,
                    )
                  }
                >
                  Edit Customer
                </button>

                {user?.role ===
                  "ADMIN" && (
                  <button
                    type="button"
                    className="table-button table-button-danger"
                    onClick={async () => {
                      setShowDetails(false);
                      await handleDelete(
                        selectedCustomer,
                      );
                      setSelectedCustomer(null);
                    }}
                  >
                    Delete Customer
                  </button>
                )}

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedCustomer(null);
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