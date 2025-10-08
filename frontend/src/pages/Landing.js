import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-900 via-sky-700 to-teal-500 text-white px-4">
      <header className="max-w-3xl text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Turn Trash into Treasure</h1>
        <p className="text-lg md:text-xl text-sky-100 mb-6">A simple marketplace that connects waste generators with recyclers to earn from materials and keep our cities clean.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="bg-white text-sky-800 px-6 py-3 rounded-md font-semibold shadow-md hover:opacity-95 transition">Create account</Link>
          <Link to="/login" className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-md font-semibold hover:bg-white hover:text-sky-800 transition">Sign in</Link>
        </div>
  <p className="mt-6 text-sm text-sky-100/90">Trusted community • Secure payments</p>
      </header>

      <main className="mt-12 w-full max-w-4xl text-center text-sky-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 p-6 rounded-lg">
            <h3 className="font-semibold text-lg">Easy Listings</h3>
            <p className="text-sm mt-2">List waste in seconds and get matched with buyers.</p>
          </div>
          <div className="bg-white/10 p-6 rounded-lg">
            <h3 className="font-semibold text-lg">Fair Prices</h3>
            <p className="text-sm mt-2">Transparent pricing so you get a fair deal.</p>
          </div>
          <div className="bg-white/10 p-6 rounded-lg">
            <h3 className="font-semibold text-lg">Secure Transactions</h3>
            <p className="text-sm mt-2">Payments and pickups coordinated through the platform.</p>
          </div>
        </div>

        {/* removed Learn more CTA to keep landing concise */}
      </main>
    </div>
  );
};

export default Landing;
