import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Truck, RefreshCw } from 'lucide-react';
import { wasteAPI, wasteExtrasAPI } from '../../services/api';

const ListingCard = ({ listing, onRefresh }) => {
  const handleEdit = () => window.location.href = `/listing/${listing.id}/edit`;
  const handleUnclaim = async () => {
    try {
      await wasteExtrasAPI.unclaimListing(listing.id);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to unclaim listing');
    }
  };

  return (
    <div className="bg-white rounded shadow p-4 flex justify-between items-start">
      <div>
        <h3 className="text-lg font-semibold">{listing.title}</h3>
        <p className="text-sm text-gray-600">{listing.description}</p>
        <p className="mt-2 text-sm">Type: <strong>{listing.type}</strong> | Qty: <strong>{listing.quantity} {listing.unit}</strong></p>
        <p className="text-sm">Price: <strong>${listing.price_per_unit}/{listing.unit}</strong></p>
        <p className="text-xs text-gray-500">Status: {listing.status}{listing.claimed_by ? ` — Claimed by ${listing.claimed_by}` : ''}</p>
      </div>
      <div className="space-y-2 text-right">
        <button onClick={handleEdit} className="block bg-blue-600 text-white px-3 py-1 rounded text-sm">Edit</button>
        {listing.status === 'reserved' && (
          <button onClick={handleUnclaim} className="block bg-yellow-500 text-white px-3 py-1 rounded text-sm">Unclaim</button>
        )}
      </div>
    </div>
  );
};

const GeneratorDashboard = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingRoute, setCreatingRoute] = useState(false);
  const [routeResult, setRouteResult] = useState(null);
  const [collectorId, setCollectorId] = useState('');
  const [maxCount, setMaxCount] = useState(5);

  const loadData = async () => {
    setLoading(true);
    try {
      const [lres, rres] = await Promise.all([wasteAPI.getMyListings(), wasteExtrasAPI.getRoutes()]);
      setListings(lres.data || []);
      setRoutes(rres.data ? (Array.isArray(rres.data) ? rres.data : [rres.data]) : []);
    } catch (err) {
      console.error('Failed to load generator dashboard data', err);
      setListings([]);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: '#f7fafc' }}>
      {/* Background image container with overlay */}
  <div className="relative bg-cover bg-center" style={{ backgroundImage: "url('/assets/landfill.jpg'), url('/assets/landfill-placeholder.svg')" }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Generator Dashboard</h1>
            <p className="text-gray-600">Create listings and manage pickup requests. This page shows only generator-related actions.</p>
          </div>
          <div className="flex items-center space-x-3">
              {/* Added CTAs moved here: Live Map and Contact (these were removed from main nav) */}
              <button onClick={() => navigate('/live-map')} className="hidden sm:inline-flex items-center bg-white/90 text-sky-800 px-3 py-2 rounded shadow hover:opacity-95 mr-2">
                Live Map
              </button>
              <button onClick={() => navigate('/contact')} className="hidden sm:inline-flex items-center bg-white/90 text-sky-800 px-3 py-2 rounded shadow hover:opacity-95 mr-2">
                Contact
              </button>
            <button aria-label="Create new listing" onClick={() => navigate('/create-listing')} className="inline-flex items-center bg-gradient-to-r from-green-500 to-teal-400 text-white px-4 py-2 rounded shadow hover:from-green-600 hover:to-teal-500 transition-all">
              <Plus className="mr-2" /> New Listing
            </button>
            <button onClick={loadData} className="inline-flex items-center px-3 py-2 border rounded text-sm bg-white hover:bg-gray-100" title="Refresh">
              <RefreshCw className="mr-2" /> Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Your Listings</h2>
            {loading ? (
              <div className="p-4 bg-white rounded shadow">Loading...</div>
            ) : listings.length === 0 ? (
              <div className="p-4 bg-white rounded shadow">You have no listings. Click "New Listing" to create one.</div>
            ) : (
              <div className="space-y-4">
                {listings.map((l) => (
                  <ListingCard key={l.id} listing={l} onRefresh={loadData} />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Routes & Assignments</h2>
            <div className="bg-white rounded shadow p-4 space-y-3">
              <p className="text-sm text-gray-600">Routes help delivery personnel collect multiple listings efficiently. You can create a simple route from this page.</p>

              {/* Create Route form */}
              <div className="p-3 border rounded bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-1">Collector ID (optional)</label>
                <input value={collectorId} onChange={(e) => setCollectorId(e.target.value)} placeholder="collector user id (leave empty to auto-assign)" className="w-full p-2 border rounded mb-2" />
                <label className="block text-sm font-medium text-gray-700 mb-1">Max listings</label>
                <input type="number" value={maxCount} onChange={(e) => setMaxCount(Number(e.target.value))} min={1} max={50} className="w-32 p-2 border rounded mb-3" />
                <div className="flex items-center space-x-2">
                  <button onClick={async () => {
                    setCreatingRoute(true);
                    setRouteResult(null);
                    try {
                      const body = { max_count: maxCount };
                      if (collectorId) body.collector_id = collectorId;
                      const resp = await wasteExtrasAPI.createRoute(body);
                      setRouteResult(resp.data);
                      // reload lists to reflect assignment
                      await loadData();
                    } catch (err) {
                      console.error('Create route failed', err);
                      alert('Failed to create route');
                    } finally {
                      setCreatingRoute(false);
                    }
                  }} className="inline-flex items-center bg-blue-600 text-white px-3 py-2 rounded">
                    <Truck className="mr-2" /> {creatingRoute ? 'Creating...' : 'Create Route'}
                  </button>
                  <button onClick={() => { setCollectorId(''); setMaxCount(5); setRouteResult(null); }} className="px-3 py-2 border rounded">Reset</button>
                </div>
                {routeResult && (
                  <div className="mt-3 p-2 bg-white border rounded">
                    <div className="text-sm font-medium">Route created: <span className="font-semibold">{routeResult.id}</span></div>
                    <div className="text-xs text-gray-600">Listings: {routeResult.ordered_listing_ids?.length || 0}</div>
                  </div>
                )}
              </div>

              <div>
                {routes.length === 0 ? (
                  <div className="text-sm">No routes assigned yet.</div>
                ) : (
                  <ul className="space-y-2">
                    {routes.map((r) => (
                      <li key={r.id} className="p-2 border rounded flex justify-between items-center">
                        <div>Route {r.id} — {r.ordered_listing_ids?.length || 0} listings</div>
                        <div className="text-xs text-gray-500">Assigned to: {r.collector || 'auto'}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        </div>
      </div>
    </div>
  );
};

export default GeneratorDashboard;
