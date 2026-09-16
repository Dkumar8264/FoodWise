const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function signIn(email, password) {
  let response;
  try {
    response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
    });
  } catch {
    throw new Error('FoodWise could not reach the server. Check that the backend is running.');
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Unable to sign in. Please try again.');
  return payload;
}

export async function getDashboard(token) {
  const response = await fetch(`${API_BASE}/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error('Unable to load the latest dashboard data.');
  return response.json();
}

export async function updatePrediction(token, id, override) {
  const response = await fetch(`${API_BASE}/predictions/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ override }) });
  if (!response.ok) throw new Error('Could not save the preparation override.');
  return response.json();
}

export async function createServiceLog(token, entry) {
  const response = await fetch(`${API_BASE}/logs`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(entry) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Could not save the service log.');
  return payload;
}
