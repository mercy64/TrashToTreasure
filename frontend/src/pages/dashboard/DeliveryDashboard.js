import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const DeliveryDashboard = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Delivery Dashboard</h1>
        <p className="mb-6 text-gray-600">View assigned pickups and navigation helpers.</p>
        <div className="space-y-4">
          <button aria-label="View my routes" onClick={() => navigate('/profile')} className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded">
            <MapPin className="mr-2" /> My Routes
          </button>
          <div className="bg-white rounded shadow p-4">Assigned pickups list will appear here with contact links.</div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
