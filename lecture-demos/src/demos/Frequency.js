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
        analyser.fftSize = 2048;
        analyserRef.current = analyser;
  
        const source = audioContext.createMediaStreamSource(mediaStream);
        source.connect(analyser);
        // Optionally connect analyser to destination if you want to hear the audio
        // analyser.connect(audioContext.destination);
      }
    }, [mediaStream]);
  
    return (
      <div className="flex justify-center min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-4xl w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">Audio Frequency Visualization</h1>        <AudioCapture setMediaStream={setMediaStream} />
        {analyserRef.current && <WaterfallVisualizer analyser={analyserRef.current} />}
      </div>
      </div>
    );
  }