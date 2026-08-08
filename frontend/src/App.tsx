import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { ProtectedRoute } from "./routes/ProtectedRoute";
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