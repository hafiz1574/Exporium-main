import { Navigate, Outlet } from "react-router-dom";

import { useAppSelector } from "../store/hooks";
import type { UserRole } from "../types/models";

type Props = {
  role?: UserRole;
};

export function ProtectedRoute({ role }: Props) {
  const { token, user } = useAppSelector((s) => s.auth);

  if (!token) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;

  return <Outlet />;
}
