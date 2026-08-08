import { NavLink } from "react-router-dom";

import { useAuth } from "../context/useAuth";

import type { UserRole } from "../types/auth";

interface MenuItem {
  label: string;
  path: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    roles: [
      "ADMIN",
      "SALES",
      "WAREHOUSE",
      "ACCOUNTS",
    ],
  },
  {
    label: "Customers",
    path: "/customers",
    roles: [
      "ADMIN",
      "SALES",
      "ACCOUNTS",
    ],
  },
  {
    label: "Follow-ups",
    path: "/follow-ups",
    roles: [
      "ADMIN",
      "SALES",
    ],
  },
  {
    label: "Products",
    path: "/products",
    roles: [
      "ADMIN",
      "SALES",
      "WAREHOUSE",
      "ACCOUNTS",
    ],
  },
  {
    label: "Warehouses",
    path: "/warehouses",
    roles: [
      "ADMIN",
      "WAREHOUSE",
    ],
  },
  {
    label: "Inventory",
    path: "/inventory",
    roles: [
      "ADMIN",
      "WAREHOUSE",
    ],
  },
  {
    label: "Sales Challans",
    path: "/sales-challans",
    roles: [
      "ADMIN",
      "SALES",
      "ACCOUNTS",
    ],
  },
  {
    label: "Users",
    path: "/users",
    roles: ["ADMIN"],
  },
];

export const Sidebar = () => {
  const { user } = useAuth();

  const visibleItems = menuItems.filter(
    (item) =>
      user &&
      item.roles.includes(user.role),
  );

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <h2>CRM</h2>
        <span>Management System</span>
      </div>

      <nav className="sidebar-nav">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive
                  ? "sidebar-link-active"
                  : ""
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};