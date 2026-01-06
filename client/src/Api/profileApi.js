// updated to use axios, may be why errors kept happening
import axios from "axios";
import { checkAuthStatus } from './authApi.js';

const API_URL = "http://localhost:3030/api/profile";

// Helper to get current userId
const getCurrentUserId = async () => {
  // Try localStorage first
  let userId = localStorage.getItem("userId");
  
  // If no userId in localStorage, check session
  if (!userId) {
    const auth = await checkAuthStatus();
    if (auth.authenticated) {
      userId = auth.userId;
      localStorage.setItem("userId", userId);
    }
  }
  
  return userId;
};

// Get current user profile (automatically uses authenticated user)
export const getCurrentUserProfile = async () => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { 
        success: false, 
        authenticated: false, 
        message: "Please login first" 
      };
    }
    
    const response = await axios.get(`${API_URL}/${userId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || "Network error" 
    };
  }
};

// Get current user stats
export const getCurrentUserStats = async () => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { 
        success: false, 
        authenticated: false, 
        message: "Please login first" 
      };
    }
    
    const response = await axios.get(`${API_URL}/${userId}/stats`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || "Network error" 
    };
  }
};

// Update profile
export const updateProfile = async (data) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { 
        success: false, 
        authenticated: false, 
        message: "Please login first" 
      };
    }
    
    const response = await axios.put(`${API_URL}/${userId}`, data, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || "Network error" 
    };
  }
};

// Change password
export const changePassword = async (data) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { 
        success: false, 
        authenticated: false, 
        message: "Please login first" 
      };
    }
    
    const response = await axios.put(`${API_URL}/${userId}/password`, data, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || "Network error" 
    };
  }
};

// For backward compatibility (explicit userId - but uses current user)
export const getUserProfile = async (userId = null) => {
  try {
    const targetUserId = userId || await getCurrentUserId();
    if (!targetUserId) {
      return { 
        success: false, 
        authenticated: false, 
        message: "Please login first" 
      };
    }
    
    const response = await axios.get(`${API_URL}/${targetUserId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || "Network error" 
    };
  }
};

export const getUserStats = async (userId = null) => {
  try {
    const targetUserId = userId || await getCurrentUserId();
    if (!targetUserId) {
      return { 
        success: false, 
        authenticated: false, 
        message: "Please login first" 
      };
    }
    
    const response = await axios.get(`${API_URL}/${targetUserId}/stats`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || "Network error" 
    };
  }
};