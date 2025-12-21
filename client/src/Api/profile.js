const API_BASE = "http://localhost:3030/api/user";

export async function getProfile(userId) {
  const res = await fetch(`${API_BASE}/${userId}`, {
    credentials: 'include' // Include cookies
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch profile: ${res.status}`);
  }
  return res.json();
}

export async function updateProfile(userId, data) {
  const res = await fetch(`${API_BASE}/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      name: data.name, 
      bio: data.bio 
    }),
    credentials: 'include'
  });
  
  if (!res.ok) {
    throw new Error(`Failed to update profile: ${res.status}`);
  }
  return res.json();
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    credentials: 'include'
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Login failed");
  }
  return res.json();
}

export async function register(username, password, name) {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, name }),
    credentials: 'include'
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Registration failed");
  }
  return res.json();
}

export async function checkAuth() {
  const res = await fetch(`${API_BASE}/check-auth`, {
    credentials: 'include'
  });
  if (!res.ok) {
    throw new Error(`Failed to check auth: ${res.status}`);
  }
  return res.json();
}

export async function logout() {
  const res = await fetch(`${API_BASE}/logout`, {
    method: "POST",
    credentials: 'include'
  });
  
  if (!res.ok) {
    throw new Error(`Failed to logout: ${res.status}`);
  }
  return res.json();
}