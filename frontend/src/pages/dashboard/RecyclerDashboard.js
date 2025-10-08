import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const RecyclerDashboard = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Recycler Dashboard</h1>
        <p className="mb-6 text-gray-600">Browse listings, view purchase history and track earnings.</p>
        <div className="space-y-4">
          <button aria-label="Browse listings" onClick={() => navigate('/listings')} className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded">
            <Search className="mr-2" /> Browse Listings
          </button>
          <div className="bg-white rounded shadow p-4">Recent purchases and earnings overview will appear here.</div>
        </div>
      </div>
    </div>
  );
};

export default RecyclerDashboard;
