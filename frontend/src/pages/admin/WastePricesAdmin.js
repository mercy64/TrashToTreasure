import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const PriceRow = ({ price, onEdit, onDisable }) => (
  <div className="flex items-center justify-between border-b py-2">
    <div>
      <div className="font-semibold">{price.type} — {price.price_per_unit}/{price.unit}</div>
      <div className="text-sm text-gray-500">Active: {price.active ? 'Yes' : 'No'}</div>
    </div>
    <div className="flex gap-2">
      <button onClick={() => onEdit(price)} className="px-3 py-1 bg-yellow-400 rounded">Edit</button>
      <button onClick={() => onDisable(price)} className="px-3 py-1 bg-red-400 rounded">{price.active ? 'Disable' : 'Enable'}</button>
    </div>
  </div>
);

const WastePricesAdmin = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ type: 'plastic', price_per_unit: '', unit: 'kg', active: true });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/waste/prices/');
      setPrices(res.data);
      // Try to fetch missing types (admin-only endpoint)
      try {
        const miss = await api.get('/api/waste/admin/missing_prices/');
        setMissing(miss.data.missing_types || []);
      } catch (e) {
        // ignore missing or permission errors; admin UI will still function
        setMissing([]);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load prices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/api/waste/prices/${editing.id}/`, form);
        setEditing(null);
      } else {
        await api.post('/api/waste/prices/', form);
      }
      setForm({ type: 'plastic', price_per_unit: '', unit: 'kg', active: true });
      await load();
    } catch (err) {
      console.error(err);
      alert('Failed to save price');
    }
  };

  const handleEdit = (p) => {
    setEditing(p);
    setForm({ type: p.type, price_per_unit: p.price_per_unit, unit: p.unit, active: p.active });
  };

  const handleDisable = async (p) => {
    try {
      await api.put(`/api/waste/prices/${p.id}/`, { active: !p.active });
      await load();
    } catch (err) {
      console.error(err);
      alert('Failed to update');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Waste Prices (Admin)</h2>
      <div className="mb-3">
  <Link to="/admin/material-families" className="text-sm text-blue-600 mr-4">Manage material families</Link>
        <a href="/admin/waste_management/materialfamily/" target="_blank" rel="noreferrer" className="text-sm text-blue-600">Open Django Admin</a>
      </div>
      {loading ? <div>Loading...</div> : (
        <div className="space-y-2">
          {prices.map((p) => <PriceRow key={p.id} price={p} onEdit={handleEdit} onDisable={handleDisable} />)}
        </div>
      )}

      {missing && missing.length > 0 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded">
          <h3 className="font-semibold mb-2">Missing price types</h3>
          <p className="text-sm text-gray-600 mb-3">These types appear in listings but have no active price configured. Click Create to add a price quickly.</p>
          <div className="flex flex-wrap gap-2">
            {missing.map((t) => (
              <button key={t} onClick={() => setForm({ ...form, type: t })} className="px-3 py-1 bg-yellow-300 rounded text-sm">Create {t}</button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="font-semibold mb-2">{editing ? 'Edit price' : 'Create price'}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm">Type</label>
            <select name="type" value={form.type} onChange={handleChange} className="mt-1 block w-full border rounded p-2">
              <option value="plastic">Plastic</option>
              <option value="paper">Paper</option>
              <option value="metal">Metal</option>
              <option value="glass">Glass</option>
              <option value="electronic">Electronic</option>
              <option value="organic">Organic</option>
              <option value="textile">Textile</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">Price per unit</label>
            <input name="price_per_unit" value={form.price_per_unit} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm">Unit</label>
            <select name="unit" value={form.unit} onChange={handleChange} className="mt-1 block w-full border rounded p-2">
              <option value="kg">kg</option>
              <option value="tonne">tonne</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input id="active" name="active" type="checkbox" checked={form.active} onChange={handleChange} />
            <label htmlFor="active" className="text-sm">Active</label>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">{editing ? 'Save' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WastePricesAdmin;
