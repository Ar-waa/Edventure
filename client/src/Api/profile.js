const API_BASE = "http://localhost:3030/api/user";

export async function getProfile(userId) {
  const res = await fetch(`${API_BASE}/${userId}`);
  return res.json();
}

export async function updateProfile(userId, data) {
  const res = await fetch(`${API_BASE}/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  return res.json();
}
