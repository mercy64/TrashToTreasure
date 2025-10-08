import React from 'react';
import { Link } from 'react-router-dom';
import { User, Truck, Factory } from 'lucide-react';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <div className="bg-white p-8 rounded-lg shadow">
          <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-6">Create an account</h1>
          <p className="text-center text-sm text-gray-600 mb-8">Choose the account type that best describes you. Each account type collects a few extra details so we can match you with the right services.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/register/generator" className="block border border-gray-200 rounded-lg p-6 hover:shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <User className="h-6 w-6 text-sky-600" />
                <h3 className="text-lg font-semibold">Waste Generator</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">I produce waste and want recyclers to collect or buy my materials.</p>
              <div className="text-sm font-medium text-sky-600">Get started →</div>
            </Link>

            <Link to="/register/recycler" className="block border border-gray-200 rounded-lg p-6 hover:shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <Factory className="h-6 w-6 text-sky-600" />
                <h3 className="text-lg font-semibold">Buyer / Recycler</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">I buy recyclables or operate a recycling business and want supply listings.</p>
              <div className="text-sm font-medium text-sky-600">Get started →</div>
            </Link>

            <Link to="/register/delivery" className="block border border-gray-200 rounded-lg p-6 hover:shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <Truck className="h-6 w-6 text-sky-600" />
                <h3 className="text-lg font-semibold">Delivery Personnel</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">I perform collections/deliveries and need access to pickup requests.</p>
              <div className="text-sm font-medium text-sky-600">Get started →</div>
            </Link>
          </div>

          <p className="text-center text-xs text-gray-500 mt-8">Already have an account? <Link to="/login" className="text-sky-600 underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;