// SessionTracker.jsx
import { useState, useEffect, useRef } from "react";

export default function SessionTracker({ userId, onSessionEnd }) {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [time, setTime] = useState(0); // in seconds
  const [xpEarned, setXpEarned] = useState(0);
  const [currentSegment, setCurrentSegment] = useState(1);
  const [xpPerSegment, setXpPerSegment] = useState(25);
  
  const timerRef = useRef(null);
  const totalMinutes = Math.floor(time / 60);

  // Calculate XP based on your rules
  const calculateXpForSegment = (segmentNumber) => {
    if (segmentNumber === 1) return 25; // First 25 minutes: 25 XP
    return 25 + ((segmentNumber - 1) * 10); // Increase by 10 each subsequent segment
  };

  // Calculate total XP earned so far
  const calculateTotalXpEarned = () => {
    let totalXp = 0;
    let remainingMinutes = totalMinutes;
    let segment = 1;
    
    while (remainingMinutes > 0) {
      const minutesInSegment = Math.min(remainingMinutes, 25);
      const segmentXp = calculateXpForSegment(segment);
      const proportion = minutesInSegment / 25;
      totalXp += segmentXp * proportion;
      
      remainingMinutes -= minutesInSegment;
      segment++;
    }
    
    return Math.floor(totalXp);
  };

  // Update XP every minute
  useEffect(() => {
    const xp = calculateTotalXpEarned();
    setXpEarned(xp);
    
    // Update current segment
    const newSegment = Math.ceil(totalMinutes / 25) || 1;
    setCurrentSegment(newSegment);
    
    // Update XP per segment for the next segment
    setXpPerSegment(calculateXpForSegment(newSegment));
  }, [totalMinutes]);

  // Start timer
  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    timerRef.current = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
  };

  // Pause timer
  const handlePause = () => {
    clearInterval(timerRef.current);
    setIsPaused(true);
  };

  // Resume timer
  const handleResume = () => {
    setIsPaused(false);
    timerRef.current = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
  };

  // Stop timer and save to database
  const handleStop = async () => {
    clearInterval(timerRef.current);
    
    if (totalMinutes > 0) {
      try {
        // Save session to database
        const sessionData = {
          userId: userId,
          duration: totalMinutes,
          xpEarned: xpEarned,
          segments: currentSegment,
          endTime: new Date().toISOString()
        };

        // Call API to save session
        const response = await saveSessionToDB(sessionData);
        
        if (response.success) {
          alert(`Session complete! You earned ${xpEarned} XP for ${totalMinutes} minutes of study.`);
          
          // Call parent callback to refresh profile
          if (onSessionEnd) {
            onSessionEnd({
              xpEarned,
              studyMinutes: totalMinutes,
              totalXP: response.data.xp,
              totalStudyMinutes: response.data.totalStudyMinutes
            });
          }
        } else {
          alert("Session saved locally, but there was an issue updating the server.");
        }
      } catch (error) {
        console.error("Error saving session:", error);
        alert(`Session complete! You earned ${xpEarned} XP. Error saving to database.`);
      }
    }
    
    // Reset timer
    resetTimer();
  };

  // Reset timer
  const handleReset = () => {
    clearInterval(timerRef.current);
    resetTimer();
  };

  const resetTimer = () => {
    setTime(0);
    setIsActive(false);
    setIsPaused(true);
    setXpEarned(0);
    setCurrentSegment(1);
    setXpPerSegment(25);
  };

  // Format time
  const formatTime = () => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get progress for current segment
  const getSegmentProgress = () => {
    const minutesInCurrentSegment = totalMinutes % 25;
    return (minutesInCurrentSegment / 25) * 100;
  };

  // Cleanup
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  // Save session to database
  const saveSessionToDB = async (sessionData) => {
    try {
      const response = await fetch(`/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error saving session:', error);
      return { success: false, message: error.message };
    }
  };

  // XP breakdown for display
  const getXpBreakdown = () => {
    const breakdown = [];
    let remainingMinutes = totalMinutes;
    let segment = 1;
    
    while (remainingMinutes > 0) {
      const minutesInSegment = Math.min(remainingMinutes, 25);
      const segmentXp = calculateXpForSegment(segment);
      const proportion = minutesInSegment / 25;
      const earnedXp = Math.floor(segmentXp * proportion);
      
      breakdown.push({
        segment,
        minutes: minutesInSegment,
        xpRate: segmentXp,
        earnedXp,
      });
      
      remainingMinutes -= minutesInSegment;
      segment++;
    }
    
    return breakdown;
  };

  const xpBreakdown = getXpBreakdown();

  return (
    <div style={{
      background: "white",
      borderRadius: 16,
      padding: 25,
      marginBottom: 30,
      boxShadow: "0 4px 20px rgba(106, 13, 173, 0.1)",
      fontFamily: "Arial, sans-serif",
    }}>
      <h2 style={{ color: "#6A0DAD", marginBottom: 20 }}>
        Focus Session Tracker
      </h2>
      
      {/* Timer Display */}
      <div style={{
        textAlign: "center",
        background: "linear-gradient(135deg, #F3E5FF 0%, #E6D4FF 100%)",
        borderRadius: 12,
        padding: 30,
        marginBottom: 25,
      }}>
        <div style={{ fontSize: 64, fontWeight: "bold", color: "#6A0DAD", marginBottom: 10 }}>
          {formatTime()}
        </div>
        <div style={{ fontSize: 18, color: "#666", marginBottom: 5 }}>
          {totalMinutes} minutes • Segment {currentSegment}
        </div>
        <div style={{ fontSize: 16, color: "#9D4EDD" }}>
          Current XP rate: {xpPerSegment} XP per 25 min
        </div>
      </div>

      {/* XP Display */}
      <div style={{
        background: "linear-gradient(135deg, #6A0DAD 0%, #9D4EDD 100%)",
        color: "white",
        borderRadius: 12,
        padding: 20,
        marginBottom: 25,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, opacity: 0.9 }}>XP Earned This Session</div>
            <div style={{ fontSize: 36, fontWeight: "bold" }}>{xpEarned} XP</div>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.2)",
            borderRadius: "50%",
            width: 60,
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: "bold",
          }}>
            {currentSegment}
          </div>
        </div>
        
        {/* Segment Progress */}
        {totalMinutes > 0 && (
          <div style={{ marginTop: 15 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 14 }}>Segment {currentSegment} Progress</span>
              <span style={{ fontSize: 14, fontWeight: "bold" }}>
                {Math.floor(totalMinutes % 25)}/25 min
              </span>
            </div>
            <div style={{ height: 8, background: "rgba(255,255,255,0.2)", borderRadius: 4, overflow: "hidden" }}>
              <div
                style={{
                  width: `${getSegmentProgress()}%`,
                  height: "100%",
                  background: "white",
                  borderRadius: 4,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div style={{ display: "flex", gap: 10, marginBottom: 25, flexWrap: "wrap" }}>
        {!isActive ? (
          <button
            onClick={handleStart}
            style={{
              flex: 1,
              minWidth: 120,
              background: "#6A0DAD",
              color: "white",
              border: "none",
              padding: "15px",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Start Session
          </button>
        ) : (
          <>
            {isPaused ? (
              <button
                onClick={handleResume}
                style={{
                  flex: 1,
                  minWidth: 120,
                  background: "#2E7D32",
                  color: "white",
                  border: "none",
                  padding: "15px",
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Resume
              </button>
            ) : (
              <button
                onClick={handlePause}
                style={{
                  flex: 1,
                  minWidth: 120,
                  background: "#ED6C02",
                  color: "white",
                  border: "none",
                  padding: "15px",
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
                Pause
              </button>
            )}
            
            <button
              onClick={handleStop}
              style={{
                flex: 1,
                minWidth: 120,
                background: "#D32F2F",
                color: "white",
                border: "none",
                padding: "15px",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M6 6h12v12H6z"/>
              </svg>
              End Session
            </button>
          </>
        )}
        
        <button
          onClick={handleReset}
          style={{
            flex: 1,
            minWidth: 120,
            background: "transparent",
            color: "#6A0DAD",
            border: "2px solid #6A0DAD",
            padding: "15px",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#6A0DAD">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          Reset
        </button>
      </div>

      {/* XP Rules */}
      <div style={{
        background: "#F0F4FF",
        borderRadius: 8,
        padding: 15,
        marginBottom: 25,
      }}>
        <h4 style={{ color: "#6A0DAD", marginBottom: 10 }}>XP Rules</h4>
        <ul style={{ margin: 0, paddingLeft: 20, color: "#333" }}>
          <li>First 25 minutes: <strong>25 XP</strong> (1 XP per minute)</li>
          <li>Next 25 minutes: <strong>35 XP</strong> (1.4 XP per minute)</li>
          <li>Next 25 minutes: <strong>45 XP</strong> (1.8 XP per minute)</li>
          <li>Each subsequent 25 minutes: <strong>+10 XP</strong> more than previous</li>
          <li>Partial minutes earn proportional XP</li>
        </ul>
      </div>

      {/* XP Breakdown */}
      {xpBreakdown.length > 0 && (
        <div>
          <h4 style={{ color: "#6A0DAD", marginBottom: 15 }}>XP Breakdown</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {xpBreakdown.map((segment, index) => (
              <div key={index} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 12,
                background: "#F9F5FF",
                borderRadius: 8,
              }}>
                <div>
                  <div style={{ fontWeight: "bold", color: "#6A0DAD" }}>
                    Segment {segment.segment}
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {segment.minutes} minutes
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: "bold", color: "#6A0DAD" }}>
                    +{segment.earnedXp} XP
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {segment.xpRate} XP per 25 min
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}