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
