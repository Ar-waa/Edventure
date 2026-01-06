import axios from "axios";

const API_URL = "http://localhost:3030/api";

export const checkAuthStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/check-auth`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Auth check error:", error);
    return { authenticated: false };
  }
};

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials, {
      withCredentials: true, 
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || "Network error" 
    };
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    console.error("Register error:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || "Network error" 
    };
  }
};

export const logout = async () => {
  try {
    const response = await axios.post(`${API_URL}/logout`, {}, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, message: "Network error" };
  }
};