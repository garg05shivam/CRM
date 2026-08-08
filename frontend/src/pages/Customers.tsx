import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createCustomer,
  getCustomers,
} from "../api/customers";

import type {
  Customer,
  CustomerInput,
  CustomerType,
  CustomerStatus,
} from "../types/customer";

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

      setForm(emptyForm);
      setShowForm(false);

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
          onClick={() =>
            setShowForm((value) => !value)
          }
        >
          {showForm
            ? "Close"
            : "Add Customer"}
        </button>
      </div>

      {showForm && (
        <form
          className="customer-form"
          onSubmit={handleCreate}
        >
          <h2>Add Customer</h2>

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
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm);
                setFormError("");
              }}
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
                : "Create Customer"}
            </button>
          </div>
        </form>
      )}

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

      {loading && (
        <div className="page-message">
          Loading customers...
        </div>
      )}

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

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
              </tr>
            </thead>

            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
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
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};