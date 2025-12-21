import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../Api/userAPI";

export default function ProfilePage() {
  const userId = localStorage.getItem("userId");
  const [profile, setProfile] = useState({ name: "", bio: "" });

  useEffect(() => {
    getProfile(userId).then(user => setProfile(user.profile));
  }, []);

  async function saveProfile() {
    await updateProfile(userId, profile);
  }

  return (
    <div className="card">
      <h2>Profile</h2>

      <input
        value={profile.name}
        onChange={e => setProfile({ ...profile, name: e.target.value })}
        placeholder="Name"
      />

      <textarea
        value={profile.bio}
        onChange={e => setProfile({ ...profile, bio: e.target.value })}
        placeholder="Bio"
      />

      <button onClick={saveProfile}>Save</button>
    </div>
  );
}
