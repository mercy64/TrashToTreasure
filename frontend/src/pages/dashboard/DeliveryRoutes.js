import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import { wasteExtrasAPI, wasteAPI } from '../../services/api';
import 'leaflet/dist/leaflet.css';

const DeliveryRoutes = () => {
  const [route, setRoute] = useState(null);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const resp = await wasteExtrasAPI.getRoutes();
        // Expecting array of routes; pick first
        const r = Array.isArray(resp.data) && resp.data.length ? resp.data[0] : resp.data;
        setRoute(r);
        if (r && r.ordered_listing_ids && r.ordered_listing_ids.length) {
          // Fetch listing details for the ids
          const qs = await wasteAPI.getListings({ ids: r.ordered_listing_ids.join(',') });
          setListings(Array.isArray(qs.data) ? qs.data : [qs.data]);
        }
      } catch (err) {
        console.warn('Failed to load routes', err);
      }
    };
    fetchRoute();
  }, []);

  if (!route || !listings.length) return <div className="bg-white rounded shadow p-4">No assigned routes yet.</div>;

  const positions = listings.map(l => [l.latitude || 0, l.longitude || 0]);

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-lg font-bold mb-2">Assigned Route</h2>
      <div className="h-64">
        <MapContainer center={positions[0]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {positions.map((pos, i) => (
            <Marker key={i} position={pos} />
          ))}
          <Polyline positions={positions} color="blue" />
        </MapContainer>
      </div>

      <ol className="mt-4 list-decimal pl-5">
        {listings.map((l) => (
          <li key={l.id} className="mb-2">
            <div className="font-medium">{l.title}</div>
            <div className="text-sm text-gray-600">{l.location} — {l.quantity} {l.unit}</div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default DeliveryRoutes;
