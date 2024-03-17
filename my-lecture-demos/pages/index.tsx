import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1>Welcome to the Lecture Demos</h1>
      <Link className="demo-link" href="/demos/pureWave">
        Simple Audio recording
      </Link>
      <Link className="demo-link" href="/demos/Frequency">
        Frequency Spectrum
      </Link>
      <Link className="demo-link" href="/demos/FrequencyListening">
        Frequency Perception
      </Link>
      <Link className="demo-link" href="/demos/ImpulseAnswer">
        Impulse Answer
      </Link>
      <Link className="demo-link" href="/demos/SpeechRecoVisualizer">
        Speech Reco preproc Visualizer
      </Link>


    </div>
  );
}
