import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

const ImpulseResponseRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const waveformRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const wavesurferRef = useRef(null);

  
  
  
  useEffect(() => {

    const handleResize = () => {
      // Here you can add logic to adjust waveform size if necessary
      // Or simply ensure that resizing does not trigger unnecessary re-renders or updates to WaveSurfer
    };
    window.addEventListener('resize', handleResize);

    wavesurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'violet',
      progressColor: 'purple',
      minPxPerSec: 200,
      pixelRatio: 1, // Adjust pixel ratio for higher resolution waveforms
      height: 500, // Fixed height for the waveform visualization
      width: 800,
    });
    wavesurferRef.current.on('click', () => {
      wavesurferRef.current.play()
    })

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { 'type' : 'audio/wav; codecs=0' });
          const audioUrl = URL.createObjectURL(audioBlob);
          wavesurferRef.current.load(audioUrl);
        };
      });

    return () => wavesurferRef.current.destroy();
  }, []);



  
  const playImpulseAndRecord = () => {
    setIsRecording(true);
    audioChunksRef.current = [];

    // Create an audio context
    const audioContext = new AudioContext();

    // Create an empty stereo buffer at the sample rate of the AudioContext
    const channels = 1; // Stereo
    const frameCount = audioContext.sampleRate * 0.01; // Buffer for 10ms
    const myArrayBuffer = audioContext.createBuffer(channels, frameCount, audioContext.sampleRate);

    // Fill the buffer with a single impulse in the first sample, then silence
    for (let channel = 0; channel < channels; channel++) {
      // This gives us the actual array that contains the data
      const nowBuffering = myArrayBuffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        // single impulse at the beginning
        nowBuffering[i] = i === 0 ? 1.0 : 0.0;
      }
    }

    // Create a buffer source node and set the buffer
    const source = audioContext.createBufferSource();
    source.buffer = myArrayBuffer;
    source.connect(audioContext.destination);
    source.start();

    // Start recording immediately after the impulse
    setTimeout(() => {
      mediaRecorderRef.current.start();
      // Stop recording after a short duration - adjust this depending on the room size and expected echo length
      setTimeout(() => {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }, 1000); // Adjust recording duration as needed
    }, 10); // Delay to ensure the impulse has finished before starting to record
};

  return (
    <div>
      <button onClick={playImpulseAndRecord} disabled={isRecording}>
        {isRecording ? 'Recording...' : 'Record Impulse Response'}
      </button>
      <div id="waveform" ref={waveformRef} style={{ width: '100%', height: '500px' }}></div>
    </div>
  );
};

export default ImpulseResponseRecorder;