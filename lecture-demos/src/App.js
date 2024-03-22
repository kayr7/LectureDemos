import "./App.css";
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home'; 
import PureWave from './demos/PureWave';
import Frequency from './demos/Frequency';
import FrequencyListening from './demos/FrequencyListening';
import ImpulseAnswer from './demos/ImpulseAnswer';
import SpeechRecoVisualizer from './demos/SpeechRecoVisualizer';
import Header from './Header';
import Footer from './Footer';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
    <Header />
    <div className="flex-grow">
    <Router>
      <Routes>
        <Route path="/" element={<div className="m-4 p-4 bg-white shadow-md rounded-lg"><Home /></div>} />
        <Route path="/demos/pureWave" element={<div className="m-4 p-4 bg-white shadow-md rounded-lg"><PureWave /></div>} />
        <Route path="/demos/Frequency" element={<div className="m-4 p-4 bg-white shadow-md rounded-lg"><Frequency /></div>} />
        <Route path="/demos/FrequencyListening" element={<div className="m-4 p-4 bg-white shadow-md rounded-lg"><FrequencyListening /></div>} />
        <Route path="/demos/ImpulseAnswer" element={<div className="m-4 p-4 bg-white shadow-md rounded-lg"><ImpulseAnswer /></div>} />
        <Route path="/demos/SpeechRecoVisualizer" element={<div className="m-4 p-4 bg-white shadow-md rounded-lg"><SpeechRecoVisualizer /></div>} />
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Router>
    </div>
    <Footer />
    </div>
  );
}

export default App;
