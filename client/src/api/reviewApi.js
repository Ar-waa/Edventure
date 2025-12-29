const API_URL = "http://localhost:3030/api/profile";

export const getUserProfile = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching profile:", error);
    return { success: false, message: error.message };
  }
};

export const getUserStats = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/${userId}/stats`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { success: false, message: error.message };
  }
};

export const updateProfile = async (userId, data) => {
  try {
    const response = await fetch(`${API_URL}/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, message: error.message };
  }
};

export const changePassword = async (userId, data) => {
  try {
    const response = await fetch(`${API_URL}/${userId}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, message: error.message };
  }
};