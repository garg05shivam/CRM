import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getDashboardSummary,
  type DashboardSummary,
} from "../api/dashboard";

export const Dashboard = () => {
  const { user, logout } = useAuth();

  const [summary, setSummary] =
    useState<DashboardSummary | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getDashboardSummary();

        setSummary(response.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          {error}
        </div>

        <button onClick={logout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>CRM Dashboard</h1>

          <p>
            Welcome,{" "}
            <strong>{user?.name}</strong>
          </p>
        </div>

        <div className="user-info">
          <span>
            {user?.role}
          </span>

          <button onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main>
        <section className="dashboard-cards">
          <div className="dashboard-card">
            <span>Total Customers</span>
            <strong>
              {summary?.total_customers}
            </strong>
          </div>

          <div className="dashboard-card">
            <span>Active Products</span>
            <strong>
              {summary?.active_products}
            </strong>
          </div>

          <div className="dashboard-card">
            <span>Active Warehouses</span>
            <strong>
              {summary?.active_warehouses}
            </strong>
          </div>

          <div className="dashboard-card">
            <span>Current Stock</span>
            <strong>
              {summary?.total_current_stock}
            </strong>
          </div>

          <div className="dashboard-card">
            <span>Confirmed Challans</span>
            <strong>
              {summary?.confirmed_challans}
            </strong>
          </div>

          <div className="dashboard-card">
            <span>Sold Quantity</span>
            <strong>
              {summary?.total_sold_quantity}
            </strong>
          </div>

          <div className="dashboard-card">
            <span>Low Stock Products</span>
            <strong>
              {summary?.low_stock_products}
            </strong>
          </div>

          <div className="dashboard-card">
            <span>Follow-ups Today</span>
            <strong>
              {summary?.follow_ups_today}
            </strong>
          </div>
        </section>

        <section className="dashboard-welcome">
          <h2>
            Welcome to your CRM
          </h2>

          <p>
            Use the CRM modules to manage
            customers, products, inventory,
            warehouses, follow-ups and sales
            challans.
          </p>
        </section>
      </main>
    </div>
  );
};