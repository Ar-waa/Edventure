import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile, changePassword } from "../api/profileApi";

export default function ProfileSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId") || "user123";

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Simple SVG icons
  const ArrowLeftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#6A0DAD" style={{ verticalAlign: 'middle' }}>
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
    </svg>
  );

  const SaveIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{ verticalAlign: 'middle' }}>
      <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
    </svg>
  );

  const LockIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{ verticalAlign: 'middle' }}>
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
    </svg>
  );

  const UserIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#666" style={{ verticalAlign: 'middle' }}>
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  );

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await updateProfile(userId, profileForm);
      
      if (res.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setTimeout(() => {
          navigate("/profile");
        }, 1500);
      } else {
        setMessage({ type: "error", text: res.message || "Failed to update profile" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      setLoading(false);
      return;
    }

    try {
      const res = await changePassword(userId, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (res.success) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setMessage({ type: "error", text: res.message || "Failed to change password" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const tabStyle = (tab) => ({
    padding: "12px 24px",
    background: activeTab === tab ? "#6A0DAD" : "transparent",
    color: activeTab === tab ? "white" : "#666",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    borderBottom: activeTab === tab ? "3px solid #6A0DAD" : "3px solid transparent",
    display: "flex",
    alignItems: "center",
    gap: 8,
  });

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 30 }}>
        <button
          onClick={() => navigate("/profile")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#6A0DAD",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <ArrowLeftIcon />
          Back to Profile
        </button>
        <h1 style={{ color: "#6A0DAD", margin: 0 }}>Account Settings</h1>
      </div>

      {/* User ID Info */}
      <div style={{ 
        background: "#F3E5FF", 
        padding: "15px 20px", 
        borderRadius: 8, 
        marginBottom: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <div style={{ fontSize: 14, color: "#666" }}>Username</div>
          <div style={{ fontWeight: "bold", color: "#6A0DAD", fontSize: 16 }}>{userId}</div>
        </div>
        <div style={{ fontSize: 14, color: "#666", fontStyle: "italic" }}>
          (Your username cannot be changed)
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", marginBottom: 30, borderBottom: "1px solid #eee" }}>
        <button style={tabStyle("profile")} onClick={() => setActiveTab("profile")}>
          <UserIcon />
          Profile
        </button>
        <button style={tabStyle("password")} onClick={() => setActiveTab("password")}>
          <LockIcon />
          Password
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div
          style={{
            padding: 15,
            background: message.type === "success" ? "#E8F5E9" : "#FFEBEE",
            color: message.type === "success" ? "#2E7D32" : "#C62828",
            borderRadius: 8,
            marginBottom: 20,
            borderLeft: `4px solid ${message.type === "success" ? "#4CAF50" : "#F44336"}`,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Profile Form */}
      {activeTab === "profile" && (
        <form onSubmit={handleProfileUpdate}>
          <div style={{ display: "flex", gap: 15, marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: 8, color: "#555", fontWeight: "500" }}>
                First Name
              </label>
              <input
                type="text"
                value={profileForm.firstName}
                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  fontSize: 16,
                }}
                placeholder="Enter your first name"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: 8, color: "#555", fontWeight: "500" }}>
                Last Name
              </label>
              <input
                type="text"
                value={profileForm.lastName}
                onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  fontSize: 16,
                }}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div style={{ marginBottom: 25 }}>
            <label style={{ display: "block", marginBottom: 8, color: "#555", fontWeight: "500" }}>
              Bio
            </label>
            <textarea
              value={profileForm.bio}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              style={{
                width: "100%",
                padding: "12px 15px",
                border: "1px solid #ddd",
                borderRadius: 8,
                fontSize: 16,
                minHeight: 120,
                resize: "vertical",
              }}
              placeholder="Tell us about yourself..."
              maxLength={500}
            />
            <div style={{ textAlign: "right", fontSize: 14, color: "#999", marginTop: 5 }}>
              {profileForm.bio.length}/500 characters
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#6A0DAD",
              color: "white",
              border: "none",
              padding: "12px 30px",
              borderRadius: 8,
              fontSize: 16,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: loading ? 0.7 : 1,
            }}
          >
            <SaveIcon />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      {/* Password Form */}
      {activeTab === "password" && (
        <form onSubmit={handlePasswordChange}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, color: "#555", fontWeight: "500" }}>
              Current Password
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              style={{
                width: "100%",
                padding: "12px 15px",
                border: "1px solid #ddd",
                borderRadius: 8,
                fontSize: 16,
              }}
              placeholder="Enter current password"
              required
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, color: "#555", fontWeight: "500" }}>
              New Password
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              style={{
                width: "100%",
                padding: "12px 15px",
                border: "1px solid #ddd",
                borderRadius: 8,
                fontSize: 16,
              }}
              placeholder="Enter new password (min 6 characters)"
              required
            />
          </div>

          <div style={{ marginBottom: 25 }}>
            <label style={{ display: "block", marginBottom: 8, color: "#555", fontWeight: "500" }}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              style={{
                width: "100%",
                padding: "12px 15px",
                border: "1px solid #ddd",
                borderRadius: 8,
                fontSize: 16,
              }}
              placeholder="Confirm new password"
              required
            />
          </div>

          <div style={{ background: "#F9F5FF", padding: 15, borderRadius: 8, marginBottom: 25 }}>
            <p style={{ margin: 0, color: "#666", fontSize: 14 }}>
              <strong>Password requirements:</strong>
              <br />
              • At least 6 characters long
              <br />
              • Should not be too common or easily guessable
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#6A0DAD",
              color: "white",
              border: "none",
              padding: "12px 30px",
              borderRadius: 8,
              fontSize: 16,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: loading ? 0.7 : 1,
            }}
          >
            <LockIcon />
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      )}
    </div>
  );
}