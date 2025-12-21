import MilestoneCard from "./milestoneCard";

export default function MilestoneSection({ title, data }) {
  return (
    <section>
      <h2>{title}</h2>
      <div className="milestone-grid">
        {Object.entries(data).map(([key, value]) => (
          <MilestoneCard
            key={key}
            name={formatName(key)}
            unlocked={value.unlocked}
            xp={value.xp}
          />
        ))}
      </div>
    </section>
  );
}

function formatName(str) {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, s => s.toUpperCase());
}
