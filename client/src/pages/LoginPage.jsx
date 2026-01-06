import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../Api/authApi";

export default function LoginPage({ setIsAuthenticated, setUserId }) {
  const [isLogin, setIsLogin] = useState(true); // Toggles between Login/Register
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstname: "",
    lastname: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let response;
      
      if (isLogin) {
        // LOGIN - uses login API
        response = await login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        // REGISTER - uses register API
        response = await register({
          email: formData.email,
          password: formData.password,
          firstname: formData.firstname,
          lastname: formData.lastname,
        });
      }
      
      if (response.success) {
        setIsAuthenticated(true);
        setUserId(response.data.userId);
        localStorage.setItem("userId", response.data.userId);
        navigate("/profile");
      } else {
        setError(response.message || "Authentication failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #6A0DAD 0%, #9D4EDD 100%)",
      fontFamily: "Arial, sans-serif",
    }}>
      <div style={{
        background: "white",
        borderRadius: 16,
        padding: 40,
        width: "100%",
        maxWidth: 400,
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
      }}>
        <h1 style={{ 
          color: "#6A0DAD", 
          textAlign: "center", 
          marginBottom: 30 
        }}>
          {isLogin ? "Login" : "Sign Up"} {/* Shows current mode */}
        </h1>

        {error && (
          <div style={{
            background: "#FFEBEE",
            color: "#D32F2F",
            padding: 12,
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 14,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/*sign up */}
          {!isLogin && (
            <>
              <div style={{ marginBottom: 15 }}>
                <input
                  type="text"
                  name="firstname"
                  placeholder="First Name"
                  value={formData.firstname}
                  onChange={handleChange}
                  required={!isLogin}
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    fontSize: 16,
                  }}
                />
              </div>
              <div style={{ marginBottom: 15 }}>
                <input
                  type="text"
                  name="lastname"
                  placeholder="Last Name"
                  value={formData.lastname}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    fontSize: 16,
                  }}
                />
              </div>
            </>
          )}

          {/* COMMON FIELDS - both login and sign up */}
          <div style={{ marginBottom: 15 }}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px 15px",
                border: "1px solid #ddd",
                borderRadius: 8,
                fontSize: 16,
              }}
            />
          </div>

          <div style={{ marginBottom: 25 }}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px 15px",
                border: "1px solid #ddd",
                borderRadius: 8,
                fontSize: 16,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "#6A0DAD",
              color: "white",
              border: "none",
              padding: "14px",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              marginBottom: 15,
            }}
          >
            {loading ? "Processing..." : (isLogin ? "Login" : "Sign Up")}
          </button>
        </form>

        {/* TOGGLE BETWEEN LOGIN AND SIGN UP */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span style={{ color: "#666", fontSize: 14 }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(""); // Clear error when switching
            }}
            style={{
              background: "none",
              border: "none",
              color: "#6A0DAD",
              cursor: "pointer",
              fontSize: 14,
              textDecoration: "underline",
              fontWeight: "bold",
            }}
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}