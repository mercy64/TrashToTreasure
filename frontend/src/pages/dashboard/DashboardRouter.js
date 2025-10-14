import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const DashboardRouter = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user || !user.role) {
    // Fallback to generic dashboard
    return <Navigate to="/dashboard/recycler" replace />;
  }

  const role = user.role.toLowerCase();
  if (role === 'generator') return <Navigate to="/dashboard/generator" replace />;
  if (role === 'recycler') return <Navigate to="/dashboard/recycler" replace />;
  if (role === 'delivery') return <Navigate to="/dashboard/delivery" replace />;
  // role unknown -> default
  return <Navigate to="/dashboard/recycler" replace />;
};

export default DashboardRouter;
