import { useState, useEffect } from "react";

export default function Pomodoro() {
  const presetTimes = {
    "25 min": 25 * 60,
    "1 hour": 60 * 60,
    "90 min": 90 * 60,
    "2 hours": 120 * 60,
  };

  const breakTimes = {
    "Short Break": 5 * 60,
    "Long Break": 15 * 60,
  };

  const [timeLeft, setTimeLeft] = useState(presetTimes["25 min"]);
  const [activeMode, setActiveMode] = useState("25 min");
  const [isRunning, setIsRunning] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    let interval = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      setFocusMode(true);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleModeChange = (e) => {
    const mode = e.target.value;
    setActiveMode(mode);
    setTimeLeft(presetTimes[mode]);
    setIsRunning(false);
    setFocusMode(false);
  };

  const handleBreakClick = (breakType) => {
    setActiveMode(breakType);
    setTimeLeft(breakTimes[breakType]);
    setIsRunning(false);
    setFocusMode(false);
  };

  const format = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // ================================
  // FULLSCREEN FOCUS MODE
  // ================================
  if (focusMode) {
    return (
      <div style={fullScreenStyles.container}>
        <div style={fullScreenStyles.timer}>{format(timeLeft)}</div>

        <div style={fullScreenStyles.controls}>
          <button
            onClick={() => setIsRunning(!isRunning)}
            style={fullScreenStyles.controlBtn}
          >
            {isRunning ? "Pause" : "Resume"}
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setFocusMode(false);
            }}
            style={fullScreenStyles.controlBtn}
          >
            Exit
          </button>
        </div>
      </div>
    );
  }

  // ================================
  // NORMAL MODE
  // ================================
  return (
    <div style={styles.container}>
      <h1>Pomodoro Timer</h1>

      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="timerSelect" style={{ marginRight: "10px" }}>
          Focus Duration:
        </label>
        <select
          id="timerSelect"
          value={activeMode in presetTimes ? activeMode : "25 min"}
          onChange={handleModeChange}
          style={styles.select}
        >
          {Object.keys(presetTimes).map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "20px" }}>
        {Object.keys(breakTimes).map((breakType) => (
          <button
            key={breakType}
            onClick={() => handleBreakClick(breakType)}
            style={
              activeMode === breakType ? styles.activeBtn : styles.btn
            }
          >
            {breakType}
          </button>
        ))}
      </div>

      <div style={styles.timer}>{format(timeLeft)}</div>

      <button
        onClick={() => setIsRunning(!isRunning)}
        style={styles.startStop}
      >
        {isRunning ? "Pause" : "Start"}
      </button>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "40px",
    fontFamily: "Arial",
  },
  timer: {
    fontSize: "60px",
    margin: "30px 0",
  },
  btn: {
    padding: "10px 20px",
    margin: "5px",
    cursor: "pointer",
    border: "1px solid gray",
    background: "#eee",
    borderRadius: "8px",
  },
  activeBtn: {
    padding: "10px 20px",
    margin: "5px",
    cursor: "pointer",
    border: "1px solid #555",
    background: "#a2d2ff",
    borderRadius: "8px",
  },
  startStop: {
    padding: "12px 25px",
    fontSize: "18px",
    cursor: "pointer",
    background: "#ffd166",
    border: "none",
    borderRadius: "10px",
  },
  select: {
    padding: "8px 12px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #aaa",
  },
};

// ==================================================
// FULLSCREEN FOCUS MODE (PAUSE + EXIT)
// ==================================================
const fullScreenStyles = {
  container: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
    color: "white",
    fontFamily: "Arial",
    position: "relative",
  },
  timer: {
    fontSize: "140px",
    fontWeight: "bold",
    marginBottom: "40px",
  },
  controls: {
    display: "flex",
    gap: "20px",
  },
  controlBtn: {
    padding: "14px 28px",
    fontSize: "18px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    background: "rgba(255,255,255,0.25)",
    color: "white",
    backdropFilter: "blur(8px)",
  },
};
