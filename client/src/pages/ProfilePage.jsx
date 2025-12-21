import { useEffect, useState } from "react";
import axios from "axios";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);

  // TEMP: hardcoded userID (replace later with login)
  const userID = "69482f3fac57622aacf960f3";

  useEffect(() => {
    axios.get(`/api/profile/${userID}`).then(res => {
      setProfile(res.data);
    });
  }, []);

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div style={styles.card}>
      <h2>{profile.FirstName || "Unnamed User"}</h2>
      <p><strong>User ID:</strong> {profile.userID}</p>

      <p><strong>XP:</strong> {profile.xp}</p>
      <p><strong>Level:</strong> {profile.level}</p>

      <h3>Achievements</h3>
      <ul>
        {Object.entries(profile.achievements).map(([key, unlocked]) => (
          <li key={key}>
            {unlocked ? "✅" : "❌"} {key}
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  card: {
    maxWidth: 500,
    margin: "auto",
    padding: 20,
    background: "#f4f4f4",
    borderRadius: 10,
  },
};