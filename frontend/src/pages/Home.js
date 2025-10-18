import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Heart, MapPin, Truck } from 'lucide-react';
import { wasteExtrasAPI } from '../services/api';
import ImpactChart from '../components/ImpactChart';
import '../styles/animations.css';
import LiveMapModal from '../components/Map/LiveMapModal';



const Home = () => {
  const [mapOpen, setMapOpen] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [estimating, setEstimating] = useState(false);
  const [estimateForm, setEstimateForm] = useState({ type: 'plastic', quantity: 10, unit: 'kg' });

  const handleEstimateChange = (e) => setEstimateForm({ ...estimateForm, [e.target.name]: e.target.value });

  const [estimateError, setEstimateError] = useState(null);

  const submitEstimate = async (e) => {
    e && e.preventDefault();
    setEstimating(true);
    setEstimateError(null);
    setEstimate(null);
    try {
      const res = await wasteExtrasAPI.estimatePrice({ type: estimateForm.type, quantity: parseFloat(estimateForm.quantity), unit: estimateForm.unit });
      const payload = res.data || res;
      setEstimate(payload);
    } catch (err) {
      console.error('Estimate error', err);
      // Prefer backend message when available
      const serverMsg = err?.response?.data?.error || err?.message || 'Failed to retrieve estimate';
      setEstimateError(String(serverMsg));
    } finally {
      setEstimating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero (reference style) */}
      <header className="bg-slate-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">Turn your waste into value — locally</h1>
          <p className="max-w-3xl mx-auto text-lg text-slate-200 mb-6">List recyclable materials, discover verified buyers and schedule collection — TrashToTreasure simplifies waste trading and pickup logistics for businesses and communities.</p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link to="/create-listing" className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-md font-semibold shadow">List Waste</Link>
            <Link to="/listings" className="inline-flex items-center gap-2 border border-white/30 text-white px-6 py-3 rounded-md">Browse Materials</Link>
            <button onClick={() => setMapOpen(true)} className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white px-4 py-2 rounded-md">Live Map</button>
          </div>

          {/* Inline quick price estimate */}
          <div className="mt-8 max-w-2xl mx-auto bg-white/10 p-4 rounded-md">
            <form onSubmit={submitEstimate} className="flex flex-wrap gap-3 items-center justify-center">
              <select name="type" value={estimateForm.type} onChange={handleEstimateChange} className="px-3 py-2 rounded-md bg-white/90 text-slate-800">
                <option value="plastic">Plastic</option>
                <option value="cardboard">Cardboard</option>
                <option value="glass">Glass</option>
                <option value="metal">Metal</option>
                <option value="textile">Textile</option>
                <option value="electronics">Electronics</option>
              </select>
              <input name="quantity" value={estimateForm.quantity} onChange={handleEstimateChange} type="number" min="0" className="px-3 py-2 rounded-md text-slate-800" />
              <select name="unit" value={estimateForm.unit} onChange={handleEstimateChange} className="px-3 py-2 rounded-md bg-white/90 text-slate-800">
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="tonne">tonne</option>
                <option value="t">t</option>
                <option value="lb">lb</option>
                <option value="oz">oz</option>
              </select>
              <button type="submit" disabled={estimating} className="bg-green-600 text-white px-4 py-2 rounded-md">{estimating ? 'Estimating...' : 'Get Price Estimate'}</button>
            </form>

            {estimateError && (
              <div className="mt-3 text-center text-sm text-red-300">
                <div><strong>Error:</strong> {estimateError}</div>
                <div className="mt-2">
                  <button onClick={submitEstimate} className="bg-white/20 text-white px-3 py-1 rounded">Retry</button>
                </div>
              </div>
            )}

            {estimate && (
              <div className="mt-3 text-center text-sm text-white/90">
                <div className="flex items-center justify-center gap-3">
                  <div>Unit price used: <strong className="text-white">{estimate.unit_price_used || estimate.breakdown?.unit_price_used || estimate.price_per_unit}</strong></div>
                  {estimate.source && (estimate.source === 'family_fallback' || estimate.source === 'global_average_fallback') && (
                    <div className="bg-yellow-300 text-yellow-900 px-2 py-1 rounded text-xs font-semibold">Estimated (fallback)</div>
                  )}
                </div>
                <div>Estimated total: <strong className="text-white">{estimate.total || estimate.breakdown?.total || estimate.estimated_total}</strong></div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Stats elevated panel */}
      <section className="-mt-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-slate-800 text-white rounded-xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">1,245</div>
              <div className="text-xs text-slate-300 tracking-wider">MATERIALS LISTED</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">843</div>
              <div className="text-xs text-slate-300 tracking-wider">COLLECTIONS COMPLETED</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">12</div>
              <div className="text-xs text-slate-300 tracking-wider">REGIONS COVERED</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">98%</div>
              <div className="text-xs text-slate-300 tracking-wider">MATERIAL RECOVERY RATE</div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact dashboard removed per request */}

      {/* How it works */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold mb-2">How TrashToTreasure Works</h3>
          <p className="text-gray-600 mb-6">A simple process to list materials, connect with verified buyers, and schedule pickup for recycling or reuse.</p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">1</div>
              </div>
              <div className="flex items-center justify-center mb-3">
                <UserPlus className="h-8 w-8 text-emerald-500" />
              </div>
              <h4 className="font-semibold mb-2">Register</h4>
              <p className="text-sm text-gray-600">Sign up as a donor, recipient organization, or delivery personnel with a simple verification process.</p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">2</div>
              </div>
              <div className="flex items-center justify-center mb-3">
                <Heart className="h-8 w-8 text-rose-500" />
              </div>
              <h4 className="font-semibold mb-2">List Materials</h4>
              <p className="text-sm text-gray-600">Create listings with photos, quantities and preferred pickup windows so nearby buyers and collectors can respond.</p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">3</div>
              </div>
              <div className="flex items-center justify-center mb-3">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">Match</h4>
              <p className="text-sm text-gray-600">Our matching engine connects your listing with verified recyclers and collectors based on location and material type.</p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">4</div>
              </div>
              <div className="flex items-center justify-center mb-3">
                <Truck className="h-8 w-8 text-emerald-600" />
              </div>
              <h4 className="font-semibold mb-2">Collect</h4>
              <p className="text-sm text-gray-600">Schedule or accept pickups; verified collectors will pick up materials and update collection status in the app.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live map modal */}
      <LiveMapModal open={mapOpen} onClose={() => setMapOpen(false)} markers={[]} />
    </div>
  );
};

export default Home;