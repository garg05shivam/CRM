import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import {
  createFollowUp,
  deleteFollowUp,
  getAllFollowUps,
  updateFollowUp,
} from "../api/followUps";
import { getCustomers } from "../api/customers";
import type { Customer } from "../types/customer";
import type { FollowUp, FollowUpInput } from "../types/followUp";

type DateFilter = "ALL" | "TODAY" | "UPCOMING" | "PAST";

export const FollowUps = () => {
  const { user } = useAuth();

  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("ALL");

  const [showForm, setShowForm] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [form, setForm] = useState<FollowUpInput>({
    note: "",
    followUpDate: new Date().toISOString().split("T")[0],
  });

  const canManage = user?.role === "ADMIN" || user?.role === "SALES";

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const todayStr = new Date().toISOString().split("T")[0];
      let filterDate: string | undefined;

      if (dateFilter === "TODAY") {
        filterDate = todayStr;
      }

      const [followUpsRes, customersRes] = await Promise.all([
        getAllFollowUps(search, filterDate),
        getCustomers(),
      ]);

      let result = followUpsRes.data;

      if (dateFilter === "UPCOMING") {
        result = result.filter(
          (item) => item.followUpDate && item.followUpDate > todayStr,
        );
      } else if (dateFilter === "PAST") {
        result = result.filter(
          (item) => item.followUpDate && item.followUpDate < todayStr,
        );
      }

      setFollowUps(result);
      setCustomers(customersRes.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load follow-ups",
      );
    } finally {
      setLoading(false);
    }
  }, [search, dateFilter]);

  useEffect(() => {
    (async () => {
      await loadData();
    })();
  }, [loadData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const resetForm = () => {
    setForm({
      note: "",
      followUpDate: new Date().toISOString().split("T")[0],
    });
    setSelectedCustomerId("");
    setEditingFollowUp(null);
    setShowForm(false);
    setError("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomerId) {
      setError("Please select a customer.");
      return;
    }

    if (!form.note.trim()) {
      setError("Please enter a note.");
      return;
    }

    if (!form.followUpDate) {
      setError("Please select a follow-up date.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await createFollowUp(selectedCustomerId, {
        note: form.note.trim(),
        followUpDate: form.followUpDate,
      });

      setSuccess("Follow-up created successfully.");
      resetForm();
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create follow-up",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (followUp: FollowUp) => {
    setEditingFollowUp(followUp);
    setSelectedCustomerId(followUp.customerId);
    setForm({
      note: followUp.note,
      followUpDate: followUp.followUpDate
        ? followUp.followUpDate.split("T")[0]
        : "",
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingFollowUp) return;

    if (!form.note.trim()) {
      setError("Please enter a note.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateFollowUp(editingFollowUp.id, {
        note: form.note.trim(),
        followUpDate: form.followUpDate,
      });

      setSuccess("Follow-up updated successfully.");
      resetForm();
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update follow-up",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this follow-up?",
    );
    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteFollowUp(id);
      setSuccess("Follow-up deleted successfully.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete follow-up",
      );
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>Customer Follow-ups</h1>
          <p>Schedule, manage and track client interactions and reminders.</p>
        </div>

        {canManage && (
          <button
            className="primary-button"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                resetForm();
                setShowForm(true);
              }
            }}
          >
            {showForm ? "Close" : "Add Follow-up"}
          </button>
        )}
      </div>

      {error && <div className="page-error">{error}</div>}
      {success && <div className="page-success">{success}</div>}

      
      {showForm && canManage && (
        <form
          className="customer-form"
          onSubmit={editingFollowUp ? handleUpdate : handleCreate}
        >
          <h2>{editingFollowUp ? "Edit Follow-up" : "New Follow-up"}</h2>

          <div className="form-grid">
            {!editingFollowUp && (
              <label>
                Customer *
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                >
                  <option value="">Select a customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.customerName} ({c.businessName})
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label>
              Follow-up Date *
              <input
                type="date"
                required
                value={form.followUpDate}
                onChange={(e) =>
                  setForm((cur) => ({ ...cur, followUpDate: e.target.value }))
                }
              />
            </label>

            <label style={{ gridColumn: "1 / -1" }}>
              Notes / Interaction Details *
              <textarea
                required
                rows={3}
                value={form.note}
                onChange={(e) =>
                  setForm((cur) => ({ ...cur, note: e.target.value }))
                }
                placeholder="Enter details about the conversation or next step..."
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                }}
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
                : editingFollowUp
                ? "Update Follow-up"
                : "Save Follow-up"}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      
      <div className="customer-toolbar" style={{ marginTop: "20px" }}>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by customer or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <div className="filter-buttons" style={{ display: "flex", gap: "8px" }}>
          {(["ALL", "TODAY", "UPCOMING", "PAST"] as DateFilter[]).map(
            (filter) => (
              <button
                key={filter}
                type="button"
                className={`secondary-button ${
                  dateFilter === filter ? "active-filter" : ""
                }`}
                onClick={() => setDateFilter(filter)}
                style={{
                  background: dateFilter === filter ? "#2563eb" : undefined,
                  color: dateFilter === filter ? "#ffffff" : undefined,
                }}
              >
                {filter === "ALL"
                  ? "All"
                  : filter === "TODAY"
                  ? "Today"
                  : filter === "UPCOMING"
                  ? "Upcoming"
                  : "Past"}
              </button>
            ),
          )}
        </div>
      </div>

      
      <div className="inventory-section">
        {loading ? (
          <div className="page-message">Loading follow-ups...</div>
        ) : followUps.length === 0 ? (
          <div className="empty-state-box">No follow-ups found.</div>
        ) : (
          <div className="customer-table-wrapper">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Follow-up Date</th>
                  <th>Note</th>
                  <th>Logged By</th>
                  {canManage && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {followUps.map((item) => {
                  const dateStr = item.followUpDate
                    ? item.followUpDate.split("T")[0]
                    : "";
                  const isToday = dateStr === todayStr;
                  const isPast = dateStr < todayStr;

                  return (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.customerName || "N/A"}</strong>
                        {item.businessName && (
                          <div style={{ fontSize: "12px", color: "#6b7280" }}>
                            {item.businessName}
                          </div>
                        )}
                      </td>
                      <td>{item.mobileNumber || "N/A"}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            isToday
                              ? "status-active"
                              : isPast
                              ? "status-inactive"
                              : ""
                          }`}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {dateStr} {isToday ? "(Today)" : ""}
                        </span>
                      </td>
                      <td style={{ maxWidth: "300px", whiteSpace: "pre-wrap" }}>
                        {item.note}
                      </td>
                      <td>{item.createdByName || "System"}</td>
                      {canManage && (
                        <td>
                          <div className="table-actions">
                            <button
                              className="action-button"
                              onClick={() => handleEdit(item)}
                            >
                              Edit
                            </button>
                            {user?.role === "ADMIN" && (
                              <button
                                className="action-button delete-button"
                                onClick={() => handleDelete(item.id)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
