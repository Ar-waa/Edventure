import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, getUserStats } from "../Api/profileApi";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = localStorage.getItem("userId");
      
      if (!userId) {
        setError("No user ID found. Please log in.");
        setLoading(false);
        return;
      }

      const [profileRes, statsRes] = await Promise.all([
        getUserProfile(userId),
        getUserStats(userId),
      ]);

      if (profileRes.success && statsRes.success) {
        setProfile(profileRes.data);
        setStats(statsRes.data);
      } else {
        setError(profileRes.message || statsRes.message || "Failed to load profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to connect to server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, color: "#6A0DAD", marginBottom: 10 }}>Loading profile...</div>
          <div style={{ width: 200, height: 4, background: "#E0D0F0", borderRadius: 2, margin: "0 auto", overflow: "hidden" }}>
            <div style={{ width: "60%", height: "100%", background: "#6A0DAD", borderRadius: 2, animation: "loading 1.5s infinite" }} />
          </div>
          <style>{`
            @keyframes loading {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(200%); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{ color: "#D32F2F", fontSize: 24, marginBottom: 20 }}>⚠️</div>
        <h2 style={{ color: "#D32F2F" }}>Error Loading Profile</h2>
        <p style={{ color: "#666", marginBottom: 30 }}>{error}</p>
        <button
          onClick={fetchProfile}
          style={{
            background: "#6A0DAD",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 16,
            marginRight: 10,
          }}
        >
          Retry
        </button>
        <button
          onClick={() => {
            localStorage.setItem("userId", "demo123");
            fetchProfile();
          }}
          style={{
            background: "#F3E5FF",
            color: "#6A0DAD",
            border: "2px solid #6A0DAD",
            padding: "12px 24px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          Use Demo Account
        </button>
      </div>
    );
  }

  if (!profile || !stats) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{ color: "#6A0DAD", fontSize: 48, marginBottom: 20 }}>👤</div>
        <h2 style={{ color: "#6A0DAD" }}>Profile Not Found</h2>
        <p style={{ color: "#666", marginBottom: 30 }}>The user profile could not be loaded.</p>
        <button
          onClick={fetchProfile}
          style={{
            background: "#6A0DAD",
            color: "white",
            border: "none",
            padding: "12px 30px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  const getDisplayName = () => {
    if (profile.firstName && profile.firstName.trim()) {
      return profile.lastName && profile.lastName.trim() 
        ? `${profile.firstName} ${profile.lastName}`
        : profile.firstName;
    }
    return profile._id || profile.username || "User";
  };

  const getInitials = () => {
    const displayName = getDisplayName();
    const names = displayName.split(" ");
    const first = names[0]?.[0] || displayName[0] || "U";
    const last = names[1]?.[0] || "";
    return `${first}${last}`.toUpperCase();
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", { 
        month: "long", 
        year: "numeric" 
      });
    } catch {
      return "Recently";
    }
  };

  const TrophyIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#6A0DAD" style={{ verticalAlign: 'middle' }}>
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H8v2h8v-2h-3v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
    </svg>
  );

  const ClockIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#6A0DAD" style={{ verticalAlign: 'middle' }}>
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
      <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
    </svg>
  );

  const AwardIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#6A0DAD" style={{ verticalAlign: 'middle' }}>
      <circle cx="12" cy="8" r="7"/>
      <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.11"/>
    </svg>
  );

  const StarIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#6A0DAD" style={{ verticalAlign: 'middle' }}>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  );

  const SettingsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{ verticalAlign: 'middle' }}>
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
    </svg>
  );

  const ArrowRightIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{ verticalAlign: 'middle' }}>
      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
    </svg>
  );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <h1 style={{ color: "#6A0DAD", margin: 0 }}>My Profile</h1>
        <button
          onClick={() => navigate("/profile/settings")}
          style={{
            background: "#6A0DAD",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: 8,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <SettingsIcon />
          Settings
          <ArrowRightIcon />
        </button>
      </div>

      {/* Profile Card */}
      <div
        style={{
          background: "linear-gradient(135deg, #6A0DAD 0%, #9D4EDD 100%)",
          color: "white",
          borderRadius: 16,
          padding: 30,
          marginBottom: 30,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: "bold",
              border: "4px solid white",
            }}
          >
            {getInitials()}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: "0 0 5px 0", fontSize: 28 }}>
              {getDisplayName()}
            </h2>
            <p style={{ opacity: 0.9, margin: "0 0 10px 0" }}>
              @{profile._id || profile.username || "username"}
            </p>
            <p style={{ fontSize: 14, opacity: 0.8 }}>
              Joined {formatDate(profile.joinedDate || profile.createdAt)}
            </p>
          </div>
        </div>

        {profile.bio && profile.bio.trim() && (
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.2)" }}>
            <p style={{ fontSize: 16, lineHeight: 1.6 }}>{profile.bio}</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 40 }}>
        {/* Level & XP */}
        <div style={{ background: "#F3E5FF", padding: 20, borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 15 }}>
            <StarIcon />
            <h3 style={{ margin: 0, color: "#6A0DAD" }}>Level {stats.level || 1}</h3>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 14, color: "#666" }}>XP Progress</span>
              <span style={{ fontWeight: "bold", color: "#6A0DAD" }}>
                {stats.xp || 0}/{stats.nextLevelXP || 1000}
              </span>
            </div>
            <div style={{ height: 8, background: "#E0D0F0", borderRadius: 4, overflow: "hidden" }}>
              <div
                style={{
                  width: `${stats.progress || 0}%`,
                  height: "100%",
                  background: "#6A0DAD",
                  borderRadius: 4,
                }}
              />
            </div>
          </div>
        </div>

        {/* Study Time */}
        <div style={{ background: "#F3E5FF", padding: 20, borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 15 }}>
            <ClockIcon />
            <h3 style={{ margin: 0, color: "#6A0DAD" }}>Study Time</h3>
          </div>
          <div style={{ fontSize: 32, fontWeight: "bold", color: "#6A0DAD" }}>
            {Math.floor((stats.totalStudyMinutes || 0) / 60)}h {(stats.totalStudyMinutes || 0) % 60}m
          </div>
          <p style={{ fontSize: 14, color: "#666", marginTop: 5 }}>Total focused study time</p>
        </div>

        {/* Achievements */}
        <div style={{ background: "#F3E5FF", padding: 20, borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 15 }}>
            <TrophyIcon />
            <h3 style={{ margin: 0, color: "#6A0DAD" }}>Achievements</h3>
          </div>
          <div style={{ fontSize: 32, fontWeight: "bold", color: "#6A0DAD" }}>
            {stats.achievements ? Object.values(stats.achievements).filter(Boolean).length : 0}/4
          </div>
          <p style={{ fontSize: 14, color: "#666", marginTop: 5 }}>Unlocked achievements</p>
        </div>
      </div>

      {/* Achievements Section */}
      <div style={{ background: "white", borderRadius: 12, padding: 25, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <h3 style={{ color: "#6A0DAD", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <AwardIcon />
          Achievement Progress
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          {[
            { key: "studied25min", label: "25 Minute Studier", desc: "Study for 25 minutes", goal: 25 },
            { key: "studied1hr", label: "1 Hour Marathon", desc: "Study for 1 hour", goal: 60 },
            { key: "studied2hr", label: "2 Hour Focus", desc: "Study for 2 hours", goal: 120 },
            { key: "studied5hr", label: "5 Hour Master", desc: "Study for 5 hours", goal: 300 },
          ].map((achievement) => {
            const unlocked = stats.achievements ? stats.achievements[achievement.key] : false;
            const progress = Math.min(((stats.totalStudyMinutes || 0) / achievement.goal) * 100, 100);

            return (
              <div key={achievement.key} style={{ display: "flex", alignItems: "center", gap: 15 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: unlocked ? "#6A0DAD" : "#F0F0F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: unlocked ? "white" : "#999",
                    fontWeight: "bold",
                  }}
                >
                  {unlocked ? "✓" : "•"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontWeight: "bold", color: unlocked ? "#6A0DAD" : "#333" }}>
                      {achievement.label}
                    </span>
                    <span style={{ fontSize: 14, color: "#666" }}>
                      {(stats.totalStudyMinutes || 0) >= achievement.goal
                        ? "Completed"
                        : `${stats.totalStudyMinutes || 0}/${achievement.goal} min`}
                    </span>
                  </div>
                  <div style={{ height: 6, background: "#F0F0F0", borderRadius: 3, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${progress}%`,
                        height: "100%",
                        background: unlocked ? "#6A0DAD" : "#9D4EDD",
                        borderRadius: 3,
                      }}
                    />
                  </div>
                  <p style={{ fontSize: 13, color: "#666", marginTop: 5, marginBottom: 0 }}>
                    {achievement.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}