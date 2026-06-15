import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import soundEngine from '../utils/SoundEngine';

const logsData = [
  { percent: 0, text: 'SYS // INITIALIZING CINEMA & US CONTEXT' },
  { percent: 12, text: 'SYS // LINKING FRAMEWORK ENGINE & MOTION LIBS' },
  { percent: 28, text: 'SYS // DEPLOYING INTERACTIVE CANVAS SHADERS' },
  { percent: 45, text: 'SYS // CALIBRATING NODE POSITION VECTORS' },
  { percent: 62, text: 'SYS // MOUNTING PROCEDURAL SYNTH OSCILLATORS' },
  { percent: 78, text: 'SYS // ESTABLISHING SQLITE REEL CONSTRAINTS' },
  { percent: 90, text: 'SYS // SYNCING ENCRYPTED STORAGE ENTRIES' },
  { percent: 100, text: 'SYS // ALL SYSTEMS OPERATIONAL. SCRAPBOOK READY.' }
];

export default function IntroLoader({ onEnter }) {
  const [percent, setPercent] = useState(0);
  const [logs, setLogs] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Prevent scrolling while loader is active
    document.body.style.overflow = 'hidden';

    let currentPercent = 0;
    const interval = setInterval(() => {
      currentPercent += Math.floor(Math.random() * 8) + 3;
      if (currentPercent >= 100) {
        currentPercent = 100;
        clearInterval(interval);
        setIsReady(true);
      }
      setPercent(currentPercent);

      // Add corresponding logs as percentage advances
      const newLogs = logsData.filter(log => log.percent <= currentPercent);
      setLogs(newLogs.map(l => `> ${l.text}... OK`));
    }, 120);

    return () => {
      clearInterval(interval);
      document.body.style.overflow = '';
    };
  }, []);

  const handleEnter = () => {
    // Initialize procedural audio engine on user gesture
    soundEngine.init();
    soundEngine.playEntrance();
    onEnter();
  };

  const handleHover = () => {
    soundEngine.playHover();
  };

  return (
    <motion.div
      className="intro-loader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="loader-glitch-overlay" />
      
      <div className="loader-container">
        <header className="loader-header">
          <span className="terminal-dot red" />
          <span className="terminal-dot yellow" />
          <span className="terminal-dot green" />
          <span className="system-title">Cinema-us // Terminal Boot</span>
        </header>

        <div className="loader-body">
          <div className="logs-scroller">
            {logs.map((log, index) => (
              <motion.div
                key={index}
                className="log-line"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
              >
                {log}
              </motion.div>
            ))}
          </div>

          <div className="progress-section">
            <div className="progress-bar-wrap">
              <motion.div 
                className="progress-bar"
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            
            <div className="progress-metrics">
              <span className="scanning-indicator">SCANNING SYSTEM REELS</span>
              <span className="percentage-display">{percent}%</span>
            </div>
          </div>

          <div className="enter-area">
            {isReady ? (
              <motion.button
                className="loader-enter-btn"
                onClick={handleEnter}
                onMouseEnter={handleHover}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                [ ENTER ARCHIVE ]
              </motion.button>
            ) : (
              <span className="loading-wait-msg">&gt; Waiting for systems authentication...</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
