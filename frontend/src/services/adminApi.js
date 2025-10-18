// Minimal admin API client for moderation endpoints
// Uses fetch; adapt to your existing axios/fetch wrapper if present

const API_BASE = process.env.REACT_APP_API_BASE || '/api/waste';

function makeHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function jsonRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { ...(options.headers || {}), ...makeHeaders() },
    credentials: 'include',
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function fetchReports() {
  // admin endpoint: GET /api/waste/admin/reports/
  return jsonRequest('/admin/reports/');
}

export async function fetchReport(reportId) {
  return jsonRequest(`/admin/reports/${reportId}/`);
}

export async function postAdminAction(reportId, actionType, reason = '') {
  // POST /api/waste/admin/reports/:id/action/
  return jsonRequest(`/admin/reports/${reportId}/action/`, {
    method: 'POST',
    body: JSON.stringify({ action_type: actionType, reason }),
  });
}

export async function createReport(listingId, reason, comments = '') {
  // POST /api/waste/listings/:id/report/
  return jsonRequest(`/listings/${listingId}/report/`, {
    method: 'POST',
    body: JSON.stringify({ reason, comments }),
  });
}

const adminApi = { fetchReports, fetchReport, postAdminAction, createReport };

export default adminApi;