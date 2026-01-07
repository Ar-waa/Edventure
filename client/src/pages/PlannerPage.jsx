import Planner from "../components/Planner";

export default function PlannerPage() {
  return (
    <div
      style={{
        width: "100%",                           // full width
        minHeight: "calc(100vh - 70px)",        // full height minus navbar
        // padding: 20,                             // optional inner space
        boxSizing: "border-box",                 // include padding in width
      }}
    >
      <Planner />
    </div>
  );
}
