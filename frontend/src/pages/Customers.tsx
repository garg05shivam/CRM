import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getCustomers,
} from "../api/customers";

import type {
  Customer,
} from "../types/customer";

export const Customers = () => {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
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

  return (
    <div className="customers-page">
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>
            Manage your CRM customers
          </p>
        </div>
      </div>

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

      {!loading &&
        !error && (
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
                      <tr
                        key={customer.id}
                      >
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