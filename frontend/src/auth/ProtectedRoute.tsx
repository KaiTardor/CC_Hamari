import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({
  roles,
  children,
}: {
  roles?: Array<"admin" | "provider" | "staff" | "client">;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: 16 }}>Cargando…</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return (
      <div style={{ padding: 16 }}>
        No tienes permiso para ver esta página.
      </div>
    );
  }

  return <>{children}</>;
}
