import { useEffect } from "react";
import Pomodoro from "./timer";

export default function PomodoroPage() {

  // Log session to backend
  async function logSession(type, seconds) {
    await fetch("http://localhost:4000/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "user123",
        type,
        seconds
      })
    });
  }

  useEffect(() => {
    // Repeatedly check until timer appears
    const timerFinder = setInterval(() => {
      // SELECT the timer display (normal and fullscreen)
      const timerEl = document.querySelector('[style*="font-size: 60px"], [style*="font-size: 140px"]');

      if (!timerEl) return;

      clearInterval(timerFinder);

      let previousValue = timerEl.textContent;
      let startSeconds = null;

      const observer = new MutationObserver(() => {
        const current = timerEl.textContent;

        // TIMER START DETECT
        if (current !== previousValue) {
          if (startSeconds === null && /^\d{2}:\d{2}$/.test(previousValue)) {
            const [m, s] = previousValue.split(":").map(Number);
            startSeconds = m * 60 + s;
          }

          // TIMER END DETECT
          if (current === "00:00" && startSeconds) {
            logSession("focus", startSeconds);
            startSeconds = null;
          }
        }

        previousValue = current;
      });

      observer.observe(timerEl, { childList: true, subtree: true });
    }, 300);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <Pomodoro />
    </div>
  );
}
