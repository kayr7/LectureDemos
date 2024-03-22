import React, { useState } from 'react';
import AudioCapture from './components/AudioCapture';
import WaterfallVisualizer from './components/WaterfallVisualizer2';

export default function SpeechRecognitionVisualizer() {
  const [mediaStream, setMediaStream] = useState(null);
  // States for toggling the visibility of each visualizer
  const [showRawAudio, setShowRawAudio] = useState(true);
  const [showFrequencySpectrum, setShowFrequencySpectrum] = useState(true);
  const [showLogFrequencySpectrum, setShowLogFrequencySpectrum] = useState(true);
  const [showMelSpectrum, setShowMelSpectrum] = useState(true);

  const [showMelCepstrum, setShowMelCepstrum] = useState(true);
  const [showMelCepstrumLiftered, setShowMelCepstrumLiftered] = useState(true);


  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Audio Visualization</h1>
      <AudioCapture setMediaStream={setMediaStream} />
      <div className="flex flex-col items-center gap-6">
        {/* Toggle for Raw Audio */}
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-150 ease-in-out" onClick={() => setShowRawAudio(!showRawAudio)}>
          {showRawAudio ? 'Hide' : 'Show'} Raw Audio
        </button>
        {showRawAudio && (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Raw Audio</h2>
            <WaterfallVisualizer mediaStream={mediaStream} visualizationType="rawAudio" width={600} height={256} />
          </div>
        )}

        {/* Toggle for Frequency Spectrum */}
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-150 ease-in-out" onClick={() => setShowFrequencySpectrum(!showFrequencySpectrum)}>
          {showFrequencySpectrum ? 'Hide' : 'Show'} Frequency Spectrum
        </button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-150 ease-in-out" onClick={() => setShowLogFrequencySpectrum(!showLogFrequencySpectrum)}>
          {showLogFrequencySpectrum ? 'No' : 'Use'} Log Frequency Spectrum
        </button>
        {showFrequencySpectrum && (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Frequency Spectrum</h2>
            <WaterfallVisualizer mediaStream={mediaStream} showLogVis={showLogFrequencySpectrum ? 'True' : 'False'} visualizationType="frequencySpectrum" width={600} height={256} />
          </div>
        )}

        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-150 ease-in-out" onClick={() => setShowMelSpectrum(!showMelSpectrum)}>
          {showMelSpectrum ? 'Hide' : 'Show'} Mel Spectrum
        </button>
        {showMelSpectrum && (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Mel Spectrum</h2>
            <WaterfallVisualizer mediaStream={mediaStream} visualizationType="MelSpectrum" width={600} height={256} />
            
          </div>
        )}


        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-150 ease-in-out" onClick={() => setShowMelCepstrum(!showMelCepstrum)}>
          {showMelCepstrum ? 'Hide' : 'Show'} Mel Cepstrum
        </button>
        {showMelCepstrum && (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Mel Cepstrum</h2>
            <WaterfallVisualizer mediaStream={mediaStream} visualizationType="MelCepstrum" width={600} height={256} />
            
          </div>
        )}

        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-150 ease-in-out" onClick={() => setShowMelCepstrumLiftered(!showMelCepstrumLiftered)}>
          {showMelCepstrumLiftered ? 'Hide' : 'Show'} Liftered Mel Cepstrum
        </button>
        {showMelCepstrumLiftered && (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Liftered Mel Cepstrum</h2>
            <WaterfallVisualizer mediaStream={mediaStream} visualizationType="MelCepstrumLiftered" width={600} height={256} />
            
          </div>
        )}
      </div>
    </div>
  );
}
