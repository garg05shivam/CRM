import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "../context/useAuth";
import type { UserRole } from "../types/auth";

interface RoleRouteProps {
  roles: UserRole[];
}

export const RoleRoute = ({
  roles,
}: RoleRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (!roles.includes(user.role)) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
};