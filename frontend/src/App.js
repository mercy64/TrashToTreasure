import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { useLocation } from 'react-router-dom';
import PrivateRoute from './components/auth/PrivateRoute';
import useSocket from './hooks/useSocket';
import { store } from './store';

// Pages
import Home from './pages/Home';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RegisterGenerator from './pages/auth/RegisterGenerator';
import RegisterRecycler from './pages/auth/RegisterRecycler';
import RegisterDelivery from './pages/auth/RegisterDelivery';
import Dashboard from './pages/Dashboard';
import DashboardRouter from './pages/dashboard/DashboardRouter';
import GeneratorDashboard from './pages/dashboard/GeneratorDashboard';
import RecyclerDashboard from './pages/dashboard/RecyclerDashboard';
import DeliveryDashboard from './pages/dashboard/DeliveryDashboard';
import NotAuthorized from './pages/NotAuthorized';
import WasteListings from './pages/waste/WasteListings';
import CreateListing from './pages/waste/CreateListing';
import ListingDetail from './pages/waste/ListingDetail';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Transactions from './pages/Transactions';
import AdminPanel from './pages/admin/AdminPanel';

const App = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      {/* Initialize socket connection for real-time updates. Falls back to polling if not available. */}
      {useSocket(store)}
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} 
          />
          <Route
            path="/register/generator"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterGenerator />}
          />
          <Route
            path="/register/recycler"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterRecycler />}
          />
          <Route
            path="/register/delivery"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterDelivery />}
          />
          <Route path="/listings" element={<WasteListings />} />
          <Route path="/listings/:id" element={<ListingDetail />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardRouter /></PrivateRoute>} />
          <Route path="/dashboard/generator" element={<PrivateRoute requiredRole="generator"><GeneratorDashboard /></PrivateRoute>} />
          <Route path="/dashboard/recycler" element={<PrivateRoute requiredRole="recycler"><RecyclerDashboard /></PrivateRoute>} />
          <Route path="/dashboard/delivery" element={<PrivateRoute requiredRole="delivery"><DeliveryDashboard /></PrivateRoute>} />
          <Route path="/not-authorized" element={<NotAuthorized />} />
          
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          
          <Route path="/create-listing" element={
            <PrivateRoute>
              <CreateListing />
            </PrivateRoute>
          } />
          
          <Route path="/messages" element={
            <PrivateRoute>
              <Messages />
            </PrivateRoute>
          } />
          
          <Route path="/transactions" element={
            <PrivateRoute>
              <Transactions />
            </PrivateRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <PrivateRoute requiredRole="admin">
              <AdminPanel />
            </PrivateRoute>
          } />

          {/* Redirect any unknown routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* Only render the footer on the public landing and home overview pages */}
      {(location.pathname === '/' || location.pathname === '/home') && <Footer />}
    </div>
  );
};

export default App;