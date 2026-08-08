import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Customers } from "./pages/Customers";
import { Products } from "./pages/Products";
import { Inventory } from "./pages/Inventory";
import { Warehouses } from "./pages/Warehouses";
import { SalesChallans } from "./pages/SalesChallans";
import { Users } from "./pages/Users";

import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RoleRoute } from "./routes/RoleRoute";

import { AppLayout } from "./layouts/AppLayout";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* Customers */}
          <Route
            element={
              <RoleRoute
                roles={[
                  "ADMIN",
                  "SALES",
                  "ACCOUNTS",
                ]}
              />
            }
          >
            <Route
              path="/customers"
              element={<Customers />}
            />
          </Route>

          {/* Follow-ups */}
          <Route
            element={
              <RoleRoute
                roles={[
                  "ADMIN",
                  "SALES",
                ]}
              />
            }
          >
            <Route
              path="/follow-ups"
              element={
                <div>
                  Follow-ups
                </div>
              }
            />
          </Route>

          {/* Products */}
          <Route
            element={
              <RoleRoute
                roles={[
                  "ADMIN",
                  "SALES",
                  "WAREHOUSE",
                  "ACCOUNTS",
                ]}
              />
            }
          >
            <Route
              path="/products"
              element={<Products />}
            />
          </Route>

          {/* Warehouses */}
          <Route
            element={
              <RoleRoute
                roles={[
                  "ADMIN",
                  "WAREHOUSE",
                ]}
              />
            }
          >
            <Route
              path="/warehouses"
              element={<Warehouses />}
            />
          </Route>

          {/* Inventory */}
          <Route
            element={
              <RoleRoute
                roles={[
                  "ADMIN",
                  "WAREHOUSE",
                ]}
              />
            }
          >
            <Route
              path="/inventory"
              element={<Inventory />}
            />
          </Route>

          {/* Sales Challans */}
          <Route
            element={
              <RoleRoute
                roles={[
                  "ADMIN",
                  "SALES",
                  "ACCOUNTS",
                ]}
              />
            }
          >
            <Route
              path="/sales-challans"
              element={
                <SalesChallans />
              }
            />
          </Route>

          {/* User Management */}
          <Route
            element={
              <RoleRoute
                roles={["ADMIN"]}
              />
            }
          >
            <Route
              path="/users"
              element={<Users />}
            />
          </Route>

        </Route>
      </Route>

      {/* Unknown routes */}
      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;