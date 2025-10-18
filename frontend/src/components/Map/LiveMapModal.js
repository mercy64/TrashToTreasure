import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const LiveMapModal = ({ open, onClose, center=[-1.286389,36.817223], markers=[] }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-lg w-[90%] h-[80%] overflow-hidden">
        <div className="p-3 border-b flex justify-between items-center">
          <h3 className="font-semibold">Live Map</h3>
          <button className="text-sm text-gray-600" onClick={onClose}>Close</button>
        </div>
        <div className="h-full">
          <MapContainer center={center} zoom={12} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {markers.map((m, i) => (
              <Marker key={i} position={[m.lat, m.lng]}>
                <Popup>{m.label}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default LiveMapModal;
