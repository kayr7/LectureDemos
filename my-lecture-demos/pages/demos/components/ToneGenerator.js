import React, { useState, useEffect, useRef } from 'react';

const ToneGenerator = () => {
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const riseIntervalRef = useRef(null); // Ref to store the interval ID
  const [isPlaying, setIsPlaying] = useState(false);
  const [frequency, setFrequency] = useState(50); // Starting frequency at 50Hz
  const [isRising, setIsRising] = useState(false); // Track if the frequency is rising

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const toggleSound = () => {
    if (isPlaying) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
      oscillatorRef.current = null;
      setIsPlaying(false);
      if (isRising) {
        clearInterval(riseIntervalRef.current);
        setIsRising(false);
      }
    } else {
      const oscillator = audioContextRef.current.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      oscillator.connect(audioContextRef.current.destination);
      oscillator.start();
      oscillatorRef.current = oscillator;
      setIsPlaying(true);
    }
  };

  const toggleRiseSound = () => {
    if (!isPlaying) return;

    if (isRising) {
      // Stop rising
      clearInterval(riseIntervalRef.current);
      setIsRising(false);
    } else {
      // Start rising
      riseIntervalRef.current = setInterval(() => {
        setFrequency(prevFrequency => {
          const newFrequency = prevFrequency + 10; // Increment frequency
          if (oscillatorRef.current) {
            oscillatorRef.current.frequency.linearRampToValueAtTime(newFrequency, audioContextRef.current.currentTime + 0.1);
          }
          return newFrequency;
        });
      }, 100); // Adjust the interval duration and frequency increment as needed
      setIsRising(true);
    }
  };

  const handleFrequencyChange = (event) => {
    const newFrequency = Number(event.target.value);
    setFrequency(newFrequency);
    if (isPlaying) {
      oscillatorRef.current.frequency.linearRampToValueAtTime(newFrequency, audioContextRef.current.currentTime + 0.1);
    }
  };

  return (
    <div className="demo-container">
      <button onClick={toggleSound}>{isPlaying ? 'Stop Sound' : 'Start Sound'}</button>
      <button onClick={toggleRiseSound}>{isRising ? 'Stop Rising' : 'Rise Sound'}</button>
      <div>
        <input
          type="range"
          min="50"
          max="20000"
          value={frequency}
          onChange={handleFrequencyChange}
          disabled={!isPlaying}
        />
        <span>{frequency} Hz</span>
      </div>
    </div>
  );
};

export default ToneGenerator;
