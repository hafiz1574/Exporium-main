import { Navigate, Outlet } from "react-router-dom";

import { useAppSelector } from "../store/hooks";
import type { UserRole } from "../types/models";

type Props = {
  role?: UserRole;
  roles?: UserRole[];
  requireAdminMode?: boolean;
};

export function ProtectedRoute({ role, roles, requireAdminMode }: Props) {
  const { token, user, sessionMode } = useAppSelector((s) => s.auth);

  if (!token) return <Navigate to="/login" replace />;

  // Wait for /me to load to avoid redirect flicker.
  if (!user) return null;

  if (requireAdminMode && sessionMode !== "admin") return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />;
}
