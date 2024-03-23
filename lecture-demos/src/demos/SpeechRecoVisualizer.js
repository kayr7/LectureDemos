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
    <div className="flex justify-center min-h-screen p-4 md:p-8">
    <div className="max-w-4xl w-full"> {/* Centering container with max-width */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">Audio Visualization</h1>
      <AudioCapture setMediaStream={setMediaStream} />
      
      <div className="flex flex-col items-start gap-6 w-full">
        {/* Toggle for Raw Audio */}
        <div className="w-full pl-4 md:pl-8">
          <label className="flex items-center cursor-pointer">
            <div className="ml-3 text-gray-700 font-medium mr-6">
              <h2 className="text-xl font-semibold">Raw Audio</h2>
            </div>
            <div className="relative">
              <input type="checkbox" id="rawAudioToggle" className="sr-only" checked={showRawAudio} onChange={() => setShowRawAudio(!showRawAudio)} />
              <div className={`block w-14 h-8 rounded-full transition-colors duration-200 ease-out ${showRawAudio ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ease-out ${showRawAudio ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </label>
        </div>
        {showRawAudio && (
          <div className="text-center">
            <WaterfallVisualizer mediaStream={mediaStream} visualizationType="rawAudio" width={600} height={256} />
          </div>
        )}

        {/* Toggle for Frequency Spectrum */}
        <div className="w-full pl-4 md:pl-8">
          <label className="flex items-center cursor-pointer">
            <div className="ml-3 text-gray-700 font-medium mr-6">
            <h2 className="text-xl font-semibold">Frequency Spectrum</h2>
            </div>
            <div className="relative">
              <input type="checkbox" id="rawAudioToggle" className="sr-only" checked={showFrequencySpectrum} onChange={() => setShowFrequencySpectrum(!showFrequencySpectrum)} />
              <div className={`block w-14 h-8 rounded-full transition-colors duration-200 ease-out ${showFrequencySpectrum ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ease-out ${showFrequencySpectrum ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </label>
        </div>
        {showFrequencySpectrum && (
          <div className="text-center">
            
            <WaterfallVisualizer mediaStream={mediaStream} showLogVis={'False'} visualizationType="frequencySpectrum" width={600} height={256} />
          </div>
        )}

        <div className="w-full pl-4 md:pl-8">
          <label className="flex items-center cursor-pointer">
            <div className="ml-3 text-gray-700 font-medium mr-6">
            <h2 className="text-xl font-semibold">Log Frequency Spectrum</h2>
            </div>
            <div className="relative">
              <input type="checkbox" id="rawAudioToggle" className="sr-only" checked={showLogFrequencySpectrum} onChange={() => setShowLogFrequencySpectrum(!showLogFrequencySpectrum)} />
              <div className={`block w-14 h-8 rounded-full transition-colors duration-200 ease-out ${showLogFrequencySpectrum ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ease-out ${showLogFrequencySpectrum ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </label>
        </div>
        {showLogFrequencySpectrum && (
          <div className="text-center">
            <WaterfallVisualizer mediaStream={mediaStream} showLogVis={'True'} visualizationType="frequencySpectrum" width={600} height={256} />
          </div>
        )}



        <div className="w-full pl-4 md:pl-8">
          <label className="flex items-center cursor-pointer">
            <div className="ml-3 text-gray-700 font-medium mr-6">
            <h2 className="text-xl font-semibold">Mel Spectrum</h2>
            </div>
            <div className="relative">
              <input type="checkbox" id="rawAudioToggle" className="sr-only" checked={showMelSpectrum} onChange={() => setShowMelSpectrum(!showMelSpectrum)} />
              <div className={`block w-14 h-8 rounded-full transition-colors duration-200 ease-out ${showMelSpectrum ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ease-out ${showMelSpectrum ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </label>
        </div>
        {showMelSpectrum && (
          <div className="text-center">
            <WaterfallVisualizer mediaStream={mediaStream} visualizationType="MelSpectrum" width={600} height={256} />
            
          </div>
        )}


        
        <div className="w-full pl-4 md:pl-8">
          <label className="flex items-center cursor-pointer">
            <div className="ml-3 text-gray-700 font-medium mr-6">
            <h2 className="text-xl font-semibold">Mel Cepstrum</h2>
            </div>
            <div className="relative">
              <input type="checkbox" id="rawAudioToggle" className="sr-only" checked={showMelCepstrum} onChange={() => setShowMelCepstrum(!showMelCepstrum)} />
              <div className={`block w-14 h-8 rounded-full transition-colors duration-200 ease-out ${showMelCepstrum ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ease-out ${showMelCepstrum ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </label>
        </div>        

        {showMelCepstrum && (
          <div className="text-center">
            <WaterfallVisualizer mediaStream={mediaStream} visualizationType="MelCepstrum" width={600} height={256} />
            
          </div>
        )}



        <div className="w-full pl-4 md:pl-8">
          <label className="flex items-center cursor-pointer">
            <div className="ml-3 text-gray-700 font-medium mr-6">
            <h2 className="text-xl font-semibold">Liftered Mel Cepstrum</h2>
            </div>
            <div className="relative">
              <input type="checkbox" id="rawAudioToggle" className="sr-only" checked={showMelCepstrumLiftered} onChange={() => setShowMelCepstrumLiftered(!showMelCepstrumLiftered)} />
              <div className={`block w-14 h-8 rounded-full transition-colors duration-200 ease-out ${showMelCepstrumLiftered ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ease-out ${showMelCepstrumLiftered ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </label>
        </div>        

        {showMelCepstrumLiftered && (
          <div className="text-center">
            <WaterfallVisualizer mediaStream={mediaStream} visualizationType="MelCepstrumLiftered" width={600} height={256} />
            
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
