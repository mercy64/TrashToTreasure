import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { mapBackendRoleToCanonical } from '../../utils/roleUtils';

const DashboardRouter = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user || !user.role) {
    // Fallback to listings (safe default)
    return <Navigate to="/listings" replace />;
  }

  const role = mapBackendRoleToCanonical(user.role);

  // New behavior requested: generators should land on the Create Listing page
  // Recyclers should land on Browse Listings
  if (role === 'generator') return <Navigate to="/create-listing" replace />;
  if (role === 'recycler') return <Navigate to="/listings" replace />;
  if (role === 'delivery') return <Navigate to="/dashboard/delivery" replace />;

  // role unknown -> default to listings
  return <Navigate to="/listings" replace />;
};

export default DashboardRouter;
