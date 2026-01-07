import { useState } from "react";

const TopicDialog = ({ onSubmit }) => {
  const [topic, setTopic] = useState("");

  const handleSubmit = () => {
    if (!topic.trim()) return;
    onSubmit(topic);
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <h3>Enter a topic</h3>
        <input
          type="text"
          placeholder="e.g. Operating Systems"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <button onClick={handleSubmit}>Generate</button>
      </div>
    </div>
  );
};

export default TopicDialog;
