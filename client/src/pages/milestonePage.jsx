import { useEffect, useState } from "react";
import axios from "axios";
import MilestoneSection from "../components/MilestoneSection";

const API_BASE = "http://localhost:3030/api";

export default function Milestones() {
  const [milestone, setMilestone] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId"); // replace with auth later

  useEffect(() => {
    async function fetchMilestones() {
      try {
        const res = await axios.get(`${API_BASE}/milestones/${userId}`);
        setMilestone(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (userId) fetchMilestones();
  }, [userId]);

  if (loading) return <p>Loading milestones...</p>;
  if (!milestone) return <p>No milestones found.</p>;

  return (
    <div className="milestones-container">
      <h1>🏆 Milestones</h1>
      <p>Total XP: <strong>{milestone.totalXp}</strong></p>

      <MilestoneSection title="Daily" data={milestone.daily} />
      <MilestoneSection title="Weekly" data={milestone.weekly} />
      <MilestoneSection title="Monthly" data={milestone.monthly} />
    </div>
  );
}
