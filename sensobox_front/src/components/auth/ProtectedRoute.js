
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ roles, isAuthenticated }) => {
  const { role } = JSON.parse(localStorage.getItem('userData'));

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }


  if (roles && !roles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
