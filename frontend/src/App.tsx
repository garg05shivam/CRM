import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Customers } from "./pages/Customers";
import { FollowUps } from "./pages/FollowUps";
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
      <Route
        path="/login"
        element={<Login />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

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
              element={<FollowUps />}
            />
          </Route>

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
              element={<SalesChallans />}
            />
          </Route>

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