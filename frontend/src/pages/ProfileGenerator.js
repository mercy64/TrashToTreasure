import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ProfileGenerator = () => {
  const [profile, setProfile] = useState({ organization: '', contact_person: '', contact_phone: '', generator_type: 'household', notes: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    api.get('/api/accounts/generator_profile/').then((res) => {
      if (!mounted) return;
      setProfile(res.data);
      setLoading(false);
    }).catch((err) => {
      // 404 means no profile yet — keep defaults
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/api/accounts/generator_profile/', profile);
      setProfile(res.data);
      setSaving(false);
      navigate('/dashboard/generator');
    } catch (err) {
      setSaving(false);
      console.error(err);
      alert('Failed to save profile');
    }
  };

  if (loading) return <div className="p-6">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Generator Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Organization</label>
          <input name="organization" value={profile.organization || ''} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Contact person</label>
          <input name="contact_person" value={profile.contact_person || ''} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Contact phone</label>
          <input name="contact_phone" value={profile.contact_phone || ''} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Generator type</label>
          <select name="generator_type" value={profile.generator_type || 'household'} onChange={handleChange} className="mt-1 block w-full border rounded p-2">
            <option value="household">Household</option>
            <option value="business">Business</option>
            <option value="institution">Institution</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Notes</label>
          <textarea name="notes" value={profile.notes || ''} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded">{saving ? 'Saving...' : 'Save profile'}</button>
        </div>
      </form>
    </div>
  );
};

export default ProfileGenerator;
