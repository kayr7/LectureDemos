import React, { useRef, useEffect } from 'react';

const WaterfallVisualizer = ({ analyser, width = 600, height = 400 }) => {
  const canvasRef = useRef(null);
  const drawVisual = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barWidth = width / bufferLength;
    
    const draw = () => {
      drawVisual.current = requestAnimationFrame(draw);

      // Shift the canvas content down to make room for new data
      const imageData = ctx.getImageData(0, 0, width, height);
      ctx.putImageData(imageData, 0, 1);

      analyser.getByteFrequencyData(dataArray);

      // Draw the new frequency data at the top
      console.log(dataArray.length);
      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i];
        const percent = value / 256;

        const [r, g, b] = [percent * 255, (1 - percent) * 255, 128]; // Example color calculation
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(i * barWidth, 0, barWidth, 1);
      }
    };

    draw();
    return () => cancelAnimationFrame(drawVisual.current);
  }, [analyser, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};

export default WaterfallVisualizer;
