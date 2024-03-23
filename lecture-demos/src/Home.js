import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
        Welcome to the Lecture Demos</h1>
      <div className="flex flex-col space-y-2">
        <Link className="text-lg text-blue-500 hover:text-blue-700 transition duration-150 ease-in-out" to="/demos/pureWave">
          Simple Audio Waveform
        </Link>
        <Link className="text-lg text-blue-500 hover:text-blue-700 transition duration-150 ease-in-out" to="/demos/Frequency">
          Frequency Spectrum
        </Link>
        <Link className="text-lg text-blue-500 hover:text-blue-700 transition duration-150 ease-in-out" to="/demos/FrequencyListening">
          Frequency Perception
        </Link>
        <Link className="text-lg text-blue-500 hover:text-blue-700 transition duration-150 ease-in-out" to="/demos/ImpulseAnswer">
          Impulse Answer
        </Link>
        <Link className="text-lg text-blue-500 hover:text-blue-700 transition duration-150 ease-in-out" to="/demos/SpeechRecoVisualizer">
          Speech Reco preproc Visualizer
        </Link>
      </div>
    </div>
  );
}
