import React, { useRef, useEffect } from 'react';

const WaterfallVisualizer = ({ mediaStream, visualizationType, width = 600, height = 400 }) => {
  const canvasRef = useRef(null);
  const drawVisual = useRef(null);

  useEffect(() => {
    if (!mediaStream) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(mediaStream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    const draw = () => {
      drawVisual.current = requestAnimationFrame(draw);

      // Shift the canvas content to the left by one pixel
      const imageData = ctx.getImageData(1, 0, width - 1, height);
      ctx.putImageData(imageData, 0, 0);
      ctx.fillStyle = 'white';
      ctx.fillRect(width - 1, 0, 1, height); // Clear the rightmost column

      if (visualizationType === 'rawAudio') {
        analyser.getByteTimeDomainData(dataArray);
        // Draw each sample as a point on the right edge
        for (let i = 0; i < bufferLength; i++) {
          const value = dataArray[i];
          const intensity = Math.abs((value-128) / 128);
          ctx.fillStyle = `rgb(${intensity * 255},${intensity * 255},${intensity * 255})`;
          const y = (i / bufferLength) * height;
          ctx.fillRect(width - 1, y, 1, 1);
        }
      } else if (visualizationType === 'frequencySpectrum') {
        analyser.getByteFrequencyData(dataArray);
        for (let i = 0; i < (bufferLength/2); i++) {
          const value = dataArray[i];
          const intensity = value / 255;
          ctx.fillStyle = `rgb(${intensity * 255},${intensity * 255},${intensity * 255})`;
          const y = height - ((i / (bufferLength/2)) * height);
          ctx.fillRect(width - 1, y, 1, height / bufferLength);
        }
      }
      else if (visualizationType === 'logFrequencySpectrum') {
        analyser.getByteFrequencyData(dataArray);
        for (let i = 0; i < (bufferLength/2); i++) {
          const value = Math.log(dataArray[i]);
          const intensity = value / (Math.log(255));
          ctx.fillStyle = `rgb(${intensity * 255},${intensity * 255},${intensity * 255})`;
          const y = height - ((i / (bufferLength/2)) * height);
          ctx.fillRect(width - 1, y, 1, height / bufferLength);
        }
      }
    };

    draw();
    return () => cancelAnimationFrame(drawVisual.current);
  }, [mediaStream, visualizationType, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};

export default WaterfallVisualizer;
