import React, { useState, useEffect, useRef } from 'react';
import AudioCapture from './components/AudioCapture';
import WaterfallVisualizer from './components/WaterfallVisualizer';




  
  export default function Home() {
    const [mediaStream, setMediaStream] = useState(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
  
    useEffect(() => {
      if (mediaStream && !audioContextRef.current) {
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
  
        const source = audioContext.createMediaStreamSource(mediaStream);
        source.connect(analyser);
        // Optionally connect analyser to destination if you want to hear the audio
        // analyser.connect(audioContext.destination);
      }
    }, [mediaStream]);
  
    return (
      <div>
        <h1>Audio Waterfall Visualization</h1>
        <AudioCapture setMediaStream={setMediaStream} />
        {analyserRef.current && <WaterfallVisualizer analyser={analyserRef.current} />}
      </div>
    );
  }