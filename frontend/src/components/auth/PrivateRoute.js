import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { mapBackendRoleToCanonical } from '../../utils/roleUtils';

const PrivateRoute = ({ children, requiredRole = null, allowedRoles = null, showNotAuthorized = false }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const userRole = mapBackendRoleToCanonical(user?.role);

  if (requiredRole && userRole !== requiredRole) {
    // If configured to show not-authorized, return that route (handled by parent)
    if (showNotAuthorized) return <Navigate to="/not-authorized" />;
    // Redirect to their dashboard based on canonical role
    if (userRole === 'generator') return <Navigate to="/dashboard/generator" />;
    if (userRole === 'recycler') return <Navigate to="/dashboard/recycler" />;
    if (userRole === 'delivery') return <Navigate to="/dashboard/delivery" />;
    return <Navigate to="/dashboard" />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (showNotAuthorized) return <Navigate to="/not-authorized" />;
    if (userRole === 'generator') return <Navigate to="/dashboard/generator" />;
    if (userRole === 'recycler') return <Navigate to="/dashboard/recycler" />;
    if (userRole === 'delivery') return <Navigate to="/dashboard/delivery" />;
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default PrivateRoute;