import React, { useEffect, useState } from 'react';
import adminApi from '../services/adminApi';

export default function Moderation() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actioning, setActioning] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.fetchReports();
      setReports(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(reportId, actionType) {
    setActioning(reportId);
    try {
      await adminApi.postAdminAction(reportId, actionType);
      // optimistic reload
      await loadReports();
    } catch (err) {
      setError(err.message || 'Action failed');
    } finally {
      setActioning(null);
    }
  }

  if (loading) return <div>Loading reports…</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Moderation — Reports</h2>
      {reports.length === 0 && <div>No reports found.</div>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {reports.map((r) => (
          <li key={r.id} style={{ border: '1px solid #ddd', marginBottom: 12, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>Report #{r.id}</strong> — {r.reason} — <em>{r.status}</em>
                <div>Listing: {r.listing?.title || '—'}</div>
                <div>Reporter: {r.reporter || '—'}</div>
                <div style={{ marginTop: 8 }}>{r.comments}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>Created: {new Date(r.created_at).toLocaleString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button onClick={() => handleAction(r.id, 'remove_listing')} disabled={actioning === r.id}>Remove listing</button>
                <div style={{ height: 8 }} />
                <button onClick={() => handleAction(r.id, 'resolve_report')} disabled={actioning === r.id}>Resolve</button>
                <div style={{ height: 8 }} />
                <button onClick={() => handleAction(r.id, 'dismiss_report')} disabled={actioning === r.id}>Dismiss</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
