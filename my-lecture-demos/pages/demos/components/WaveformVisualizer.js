import React, { useRef, useEffect } from 'react';

const WaveformVisualizer = ({ audioData }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // Check if audioData is available
    if (!audioData) return;

    // Start drawing the waveform
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#007bff'; // Blue line for the waveform

    // Calculate the width of each segment of the line
    const sliceWidth = width * 1.0 / audioData.length;
    let x = 0; // Starting point on the x-axis

    for (let i = 0; i < audioData.length; i++) {
      const v = audioData[i] + 1.0; // Normalize the amplitude to [0, 2]
      const y = v * height / 2; // Scale the amplitude to the canvas height

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth; // Move to the next segment
    }

    ctx.lineTo(width, height / 2); // Draw a line back to the middle at the end
    ctx.stroke(); // Render the drawn waveform
  }, [audioData]);

  return (
    <div style={{ border: '1px solid #000', marginTop: '20px' }}>
      <canvas ref={canvasRef} width="400" height="100"></canvas>
    </div>
  );
};

export default WaveformVisualizer;
