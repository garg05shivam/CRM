import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Customers } from "./pages/Customers";

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