import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const MaterialFamiliesAdmin = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', aliases: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', aliases: '', description: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/waste/admin/material_families/');
      setFamilies(res.data);
    } catch (e) {
      console.error(e);
      alert('Failed to load families');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, aliases: form.aliases ? form.aliases.split(',').map(s => s.trim()) : [] };
      await api.post('/api/waste/admin/material_families/', data);
      setForm({ name: '', aliases: '', description: '' });
      await load();
    } catch (err) {
      console.error(err);
      alert('Failed to create family');
    }
  };

  const startEdit = (f) => {
    setEditingId(f.id);
    setEditForm({ name: f.name || '', aliases: (f.aliases || []).join(', '), description: f.description || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', aliases: '', description: '' });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...editForm, aliases: editForm.aliases ? editForm.aliases.split(',').map(s => s.trim()) : [] };
      await api.put(`/api/waste/admin/material_families/${editingId}/`, data);
      cancelEdit();
      await load();
    } catch (err) {
      console.error(err);
      alert('Failed to save changes');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material family? This cannot be undone.')) return;
    try {
      await api.delete(`/api/waste/admin/material_families/${id}/`);
      await load();
    } catch (err) {
      console.error(err);
      alert('Failed to delete family');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Material Families (Admin)</h2>
      <div className="mb-4">
  <a href="/admin/waste_management/materialfamily/" target="_blank" rel="noreferrer" className="text-sm text-blue-600">Open Django Admin editor</a>
      </div>
      {loading ? <div>Loading...</div> : (
        <div className="space-y-2">
          {families.map(f => (
            <div key={f.id} className="border p-2 rounded">
              {editingId === f.id ? (
                <form onSubmit={saveEdit} className="space-y-2">
                  <input name="name" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="block w-full border rounded p-1" />
                  <input name="aliases" value={editForm.aliases} onChange={e => setEditForm({ ...editForm, aliases: e.target.value })} className="block w-full border rounded p-1" />
                  <input name="description" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="block w-full border rounded p-1" />
                  <div className="flex gap-2 justify-end mt-2">
                    <button type="button" onClick={cancelEdit} className="px-3 py-1 border rounded">Cancel</button>
                    <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="font-semibold">{f.name}</div>
                  <div className="text-sm text-gray-600">Aliases: {(f.aliases || []).join(', ')}</div>
                  <div className="text-sm text-gray-600">{f.description}</div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => startEdit(f)} className="px-3 py-1 border rounded">Edit</button>
                    <button onClick={() => handleDelete(f.id)} className="px-3 py-1 border rounded text-red-600">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Create family</h3>
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="block text-sm">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm">Aliases (comma separated)</label>
            <input name="aliases" value={form.aliases} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm">Description</label>
            <input name="description" value={form.description} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialFamiliesAdmin;
