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

export const createDemoUser = async () => {
  try {
    // This would normally call your backend to create a demo user
    // For now, we'll simulate it
    const demoUser = {
      _id: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: `demo_user_${Date.now().toString(36)}`,
      email: `demo_${Date.now()}@example.com`,
      firstName: "Demo",
      lastName: "User",
      bio: "Welcome to my learning journey! This is a demo profile.",
      joinedDate: new Date().toISOString(),
    };
    
    return {
      success: true,
      data: demoUser,
      message: "Demo user created successfully"
    };
  } catch (error) {
    console.error("Error creating demo user:", error);
    return {
      success: false,
      message: error.message || "Failed to create demo user"
    };
  }
};