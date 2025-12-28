const API_URL = "http://localhost:3030/api/profile";

export const getUserProfile = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/${userId}`);
    return await response.json();
  } catch (error) {
    return { success: false, message: "Network error" };
  }
};

export const updateProfile = async (userId, data) => {
  try {
    const response = await fetch(`${API_URL}/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: "Network error" };
  }
};

export const changePassword = async (userId, data) => {
  try {
    const response = await fetch(`${API_URL}/${userId}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: "Network error" };
  }
};

export const getUserStats = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/${userId}/stats`);
    return await response.json();
  } catch (error) {
    return { success: false, message: "Network error" };
  }
};

export const updateUserStats = async (userId, data) => {
  try {
    const response = await fetch(`${API_URL}/${userId}/stats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: "Network error" };
  }
};

