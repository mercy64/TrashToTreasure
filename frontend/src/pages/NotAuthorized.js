import React from 'react';
import { Link } from 'react-router-dom';

const NotAuthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-xl p-8 bg-white rounded-lg shadow text-center">
        <h1 className="text-2xl font-bold mb-4">Not Authorized</h1>
        <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
        <div className="flex justify-center gap-3">
          <Link to="/" aria-label="Go to home" className="inline-block px-4 py-2 bg-blue-500 text-white rounded">
            Go Home
          </Link>
          <Link to="/dashboard" aria-label="Go to your dashboard" className="inline-block px-4 py-2 bg-gray-100 rounded">
            Go to your dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotAuthorized;
