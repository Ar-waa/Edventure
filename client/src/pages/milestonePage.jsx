import { useEffect, useState } from "react";
import MilestoneSection from "../components/MilestoneSection";
import {milestoneApi} from "../Api/milestoneApi";


export default function Milestones() {
  const [milestone, setMilestone] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId"); // replace with auth later

  useEffect(() => {
    async function fetchMilestones() {
      try {
        const res = await milestoneApi.getMilestones(userId);
        setMilestone(res.data);
      } catch (err) {
    // If the error is 404, it means we need to create the document
    if (err.response && err.response.status === 404) {
      console.log("No milestone found, creating one...");
      const newRes = await axios.post(`${API_BASE}/milestones/${userId}/create`);
      setMilestone(newRes.data);
    } else {
      console.error(err);
    }
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
