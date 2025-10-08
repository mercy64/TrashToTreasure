import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

const GeneratorDashboard = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Generator Dashboard</h1>
        <p className="mb-6 text-gray-600">Create listings and manage pickup requests.</p>
        <div className="space-y-4">
          <button aria-label="Create new listing" onClick={() => navigate('/create-listing')} className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded">
            <Plus className="mr-2" /> Create New Listing
          </button>
          <div className="bg-white rounded shadow p-4">Pickup requests and recent activity will appear here.</div>
        </div>
      </div>
    </div>
  );
};

export default GeneratorDashboard;
