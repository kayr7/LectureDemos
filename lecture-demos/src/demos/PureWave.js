import { useState, useEffect, useRef } from 'react';
import AudioCapture from './components/AudioCapture';
import WaveformVisualizer from './components/WaveformVisualizer';

export default function Home() {
  const [mediaStream, setMediaStream] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const audioContextRef = useRef(null);
  const workerRef = useRef(null);

  


  useEffect(() => {
    if (!mediaStream) return;
  
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
  
    const worker = new Worker('/processorWorker.js');
    workerRef.current = worker;
    workerRef.current.onmessage = (e) => {
        setAudioData(e.data);
      };
  
    audioContext.audioWorklet.addModule('/audioProcessorWorklet.js').then(() => {
      const processor = new AudioWorkletNode(audioContext, 'basic-processor');
      const source = audioContext.createMediaStreamSource(mediaStream);
  
      // Listen for messages (audio data) from the audio processor
      processor.port.onmessage = (event) => {
        // Post the audio data to the worker for processing
        worker.postMessage(event.data);
      };
  
      source.connect(processor).connect(audioContext.destination);
    });
  
    // Clean up
    return () => {
      worker.terminate();
      audioContext.close();
    };
  }, [mediaStream]);
  


  return (
    <div className="flex justify-center min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-4xl w-full">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">Real-time Audio Processing and Visualization</h1>
      <AudioCapture setMediaStream={setMediaStream} />
      <div className="mt-6 flex justify-center">
      <WaveformVisualizer audioData={audioData} />
      </div>
    </div>
    </div>
  );
}
