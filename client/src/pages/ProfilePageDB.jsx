import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, getUserStats, createDemoUser } from "../Api/profileApi";
import SessionTracker from "../components/SessionTracker";



export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrCreateUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Starting profile fetch/creation...");
        
        // First, check if we have a user ID in localStorage
        let userId = localStorage.getItem("userId");
        
        if (!userId) {
          console.log("No user ID found. Checking for demo user or creating one...");
          
          // Check if we have a demo user ID
          userId = localStorage.getItem("demoUserId");
          
          if (!userId) {
            console.log("Creating demo user...");
            // Try to create a demo user
            const demoUserRes = await createDemoUser();
            
            if (demoUserRes && demoUserRes.success) {
              userId = demoUserRes.data._id;
              localStorage.setItem("demoUserId", userId);
              localStorage.setItem("userId", userId);
              setIsDemoMode(true);
              console.log("Demo user created with ID:", userId);
            } else {
              throw new Error("Could not create or find a user profile");
            }
          } else {
            setIsDemoMode(true);
            console.log("Using existing demo user:", userId);
          }
        }
        
        console.log("Fetching profile for userId:", userId);
        
        // Try to fetch profile and stats
        const [profileRes, statsRes] = await Promise.allSettled([
          getUserProfile(userId),
          getUserStats(userId),
        ]);

        console.log("Profile API result:", profileRes);
        console.log("Stats API result:", statsRes);

        // Handle profile response
        let profileData = null;
        let statsData = null;

        if (profileRes.status === 'fulfilled' && profileRes.value.success) {
          profileData = profileRes.value.data;
        } else {
          console.warn("Profile fetch failed:", profileRes.reason || profileRes.value);
        }

        if (statsRes.status === 'fulfilled' && statsRes.value.success) {
          statsData = statsRes.value.data;
        } else {
          console.warn("Stats fetch failed:", statsRes.reason || statsRes.value);
        }

        // If we have data, use it
        if (profileData || statsData) {
          setProfile(profileData);
          setStats(statsData);
          
          // Create mock data for any missing parts
          if (!profileData && statsData) {
            setProfile({
              _id: userId,
              username: `user_${userId.substring(0, 6)}`,
              email: "user@example.com",
              firstName: "Demo",
              lastName: "User",
              bio: "Welcome to my learning journey! I'm using this app to track my study progress.",
              joinedDate: new Date(),
            });
          }
          
          if (!statsData && profileData) {
            setStats({
              xp: 1250,
              level: 3,
              totalStudyMinutes: 185,
              achievements: {
                studied25min: true,
                studied1hr: true,
                studied2hr: false,
                studied5hr: false,
              },
              nextLevelXP: 3000,
              progress: 41.67,
            });
          }
        } else {
          // If both API calls failed, use mock data
          console.log("Both API calls failed, using mock data for demo");
          setIsDemoMode(true);
          setProfile({
            _id: userId,
            username: `demo_${Date.now().toString(36)}`,
            email: "demo@example.com",
            firstName: "Demo",
            lastName: "User",
            bio: "Welcome to my learning journey! This is a demo profile. To see real data, please set up user authentication.",
            joinedDate: new Date(),
          });
          setStats({
            xp: 1250,
            level: 3,
            totalStudyMinutes: 185,
            achievements: {
              studied25min: true,
              studied1hr: true,
              studied2hr: false,
              studied5hr: false,
            },
            nextLevelXP: 3000,
            progress: 41.67,
          });
        }
        
      } catch (error) {
        console.error("Error in profile setup:", error);
        setError(error.message || "Failed to setup profile");
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateUserProfile();
  }, []);

  // Create a new demo user
  const createNewDemoUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const demoUserRes = await createDemoUser();
      
      if (demoUserRes && demoUserRes.success) {
        const userId = demoUserRes.data._id;
        localStorage.setItem("demoUserId", userId);
        localStorage.setItem("userId", userId);
        setIsDemoMode(true);
        
        // Reload to fetch the new user's data
        window.location.reload();
      } else {
        setError("Failed to create demo user");
      }
    } catch (error) {
      console.error("Error creating demo user:", error);
      setError(error.message || "Failed to create demo user");
      setLoading(false);
    }
  };

  // Reset demo user
  const resetDemoUser = () => {
    localStorage.removeItem("demoUserId");
    localStorage.removeItem("userId");
    setProfile(null);
    setStats(null);
    setIsDemoMode(false);
    setLoading(true);
    // Trigger a reload to create a new demo user
    setTimeout(() => window.location.reload(), 100);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, color: "#6A0DAD", marginBottom: 10 }}>Loading profile...</div>
          <div style={{ fontSize: 14, color: "#666" }}>Setting up your learning profile</div>
        </div>
      </div>
    );
  }
  
<SessionTracker 
  userId={displayProfile._id || "user123"} 
  onSessionEnd={(sessionData) => {
    // Refresh profile data when session ends
    console.log("Session completed:", sessionData);
    // You can trigger a refresh here if needed
    window.location.reload(); // Simple refresh
  }}
/>

  // Error state
  if (error && !profile) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 40, textAlign: "center" }}>
        <h2 style={{ color: "#6A0DAD", marginBottom: 20 }}>Setup Required</h2>
        <div style={{ 
          background: "#F3E5FF", 
          padding: 25, 
          borderRadius: 12, 
          marginBottom: 25,
          textAlign: "left"
        }}>
          <p style={{ color: "#333", marginBottom: 10, fontSize: 16 }}>
            <strong>Note:</strong> No login system is currently set up.
          </p>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 15 }}>
            You can use demo mode to test the profile page:
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={createNewDemoUser}
              style={{
                background: "#6A0DAD",
                color: "white",
                border: "none",
                padding: "12px 20px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              Enter Demo Mode
            </button>
          </div>
        </div>
        
        <div style={{ fontSize: 12, color: "#999", marginTop: 20 }}>
          Error details: {error}
        </div>
      </div>
    );
  }

  // Get display name
  const getDisplayName = () => {
    if (profile?.firstName) {
      return profile.lastName ? `${profile.firstName} ${profile.lastName}` : profile.firstName;
    }
    return profile?.username || profile?._id || "Demo User";
  };

  // Get initials from display name
  const getInitials = () => {
    const displayName = getDisplayName();
    const names = displayName.split(" ");
    const first = names[0]?.[0] || displayName[0] || "D";
    const last = names[1]?.[0] || "";
    return `${first}${last}`.toUpperCase();
  };

  // Simple SVG icons as React components
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

  const DemoBadge = () => (
    <span style={{
      background: "#FF6B6B",
      color: "white",
      fontSize: 12,
      padding: "4px 8px",
      borderRadius: 12,
      marginLeft: 10,
      fontWeight: "bold"
    }}>
      DEMO
    </span>
  );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h1 style={{ color: "#6A0DAD", margin: 0 }}>My Profile</h1>
          {isDemoMode && <DemoBadge />}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {isDemoMode && (
            <button
              onClick={resetDemoUser}
              style={{
                background: "transparent",
                color: "#6A0DAD",
                border: "2px solid #6A0DAD",
                padding: "8px 16px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Reset Demo
            </button>
          )}
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
            disabled={isDemoMode}
            title={isDemoMode ? "Settings unavailable in demo mode" : ""}
          >
            <SettingsIcon />
            Settings
            <ArrowRightIcon />
          </button>
        </div>
      </div>

      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div style={{
          background: "linear-gradient(135deg, #FFE5E5 0%, #FFD6D6 100%)",
          border: "1px solid #FF6B6B",
          borderRadius: 12,
          padding: 15,
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <strong style={{ color: "#D32F2F" }}>Demo Mode</strong>
            <p style={{ color: "#666", margin: "5px 0 0 0", fontSize: 14 }}>
              You're viewing demo data. Set up user authentication for real user profiles.
            </p>
          </div>
          <button
            onClick={resetDemoUser}
            style={{
              background: "transparent",
              color: "#D32F2F",
              border: "1px solid #D32F2F",
              padding: "8px 16px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            New Demo User
          </button>
        </div>
      )}

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
            <p style={{ opacity: 0.9, margin: "0 0 10px 0" }}>@{profile?.username || profile?._id || "demo_user"}</p>
            <p style={{ fontSize: 14, opacity: 0.8 }}>
              Joined {new Date(profile?.joinedDate || Date.now()).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {profile?.bio && (
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
            <h3 style={{ margin: 0, color: "#6A0DAD" }}>Level {stats?.level || 1}</h3>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 14, color: "#666" }}>XP Progress</span>
              <span style={{ fontWeight: "bold", color: "#6A0DAD" }}>
                {stats?.xp || 0}/{stats?.nextLevelXP || 1000}
              </span>
            </div>
            <div style={{ height: 8, background: "#E0D0F0", borderRadius: 4, overflow: "hidden" }}>
              <div
                style={{
                  width: `${stats?.progress || 0}%`,
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
            {Math.floor((stats?.totalStudyMinutes || 0) / 60)}h {(stats?.totalStudyMinutes || 0) % 60}m
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
            {Object.values(stats?.achievements || {}).filter(Boolean).length}/
            {Object.keys(stats?.achievements || {}).length || 4}
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
          {Object.entries(stats?.achievements || {
            studied25min: true,
            studied1hr: true,
            studied2hr: false,
            studied5hr: false,
          }).map(([key, unlocked]) => {
            // Create display names based on achievement keys
            const getAchievementInfo = (achievementKey) => {
              const info = {
                studied25min: { label: "25 Minute Studier", desc: "Study for 25 minutes", goal: 25 },
                studied1hr: { label: "1 Hour Marathon", desc: "Study for 1 hour", goal: 60 },
                studied2hr: { label: "2 Hour Focus", desc: "Study for 2 hours", goal: 120 },
                studied5hr: { label: "5 Hour Master", desc: "Study for 5 hours", goal: 300 },
              };
              return info[achievementKey] || { label: key.replace(/([A-Z])/g, ' $1'), desc: "Achievement", goal: 0 };
            };

            const achievement = getAchievementInfo(key);
            const progress = Math.min(((stats?.totalStudyMinutes || 0) / achievement.goal) * 100, 100);

            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 15 }}>
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
                      {(stats?.totalStudyMinutes || 0) >= achievement.goal
                        ? "Completed"
                        : `${stats?.totalStudyMinutes || 0}/${achievement.goal} min`}
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