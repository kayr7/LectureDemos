import React, { useState } from 'react';
import AudioCapture from './components/AudioCapture';
import WaterfallVisualizer from './components/WaterfallVisualizer2';

export default function SpeechRecognitionVisualizer() {
  const [mediaStream, setMediaStream] = useState(null);
  // States for toggling the visibility of each visualizer
  const [showRawAudio, setShowRawAudio] = useState(true);
  const [showFrequencySpectrum, setShowFrequencySpectrum] = useState(true);
  const [showLogFrequencySpectrum, setShowLogFrequencySpectrum] = useState(true);
  // Add additional states for other visualizations as needed

  return (
    <div>
      <h1>Audio Visualization</h1>
      <AudioCapture setMediaStream={setMediaStream} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        {/* Toggle for Raw Audio */}
        <button onClick={() => setShowRawAudio(!showRawAudio)}>
          {showRawAudio ? 'Hide' : 'Show'} Raw Audio
        </button>
        {showRawAudio && (
          <div>
            <h2>Raw Audio</h2>
            <WaterfallVisualizer mediaStream={mediaStream} visualizationType="rawAudio" width={600} height={200} />
          </div>
        )}

        {/* Toggle for Frequency Spectrum */}
        <button onClick={() => setShowFrequencySpectrum(!showFrequencySpectrum)}>
          {showFrequencySpectrum ? 'Hide' : 'Show'} Frequency Spectrum
        </button>
        {showFrequencySpectrum && (
          <div>
            <h2>Frequency Spectrum</h2>
            <WaterfallVisualizer mediaStream={mediaStream} visualizationType="frequencySpectrum" width={600} height={200} />
          </div>
        )}

        <button onClick={() => setShowLogFrequencySpectrum(!showLogFrequencySpectrum)}>
          {showLogFrequencySpectrum ? 'Hide' : 'Show'} Log Frequency Spectrum
        </button>
        {showLogFrequencySpectrum && (
          <div>
            <h2>Log Frequency Spectrum</h2>
            <WaterfallVisualizer mediaStream={mediaStream} visualizationType="logFrequencySpectrum" width={600} height={200} />
          </div>
        )}

        {/* Add toggles and conditional rendering for other visualizations here */}
      </div>
    </div>
  );
}
