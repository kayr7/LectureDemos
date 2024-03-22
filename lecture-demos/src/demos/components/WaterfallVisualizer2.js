import React, { useRef, useEffect } from 'react';


function dct(signal) {
  const N = signal.length;
  const result = new Float32Array(N);

  for (let k = 0; k < N; k++) {
      let sum = 0;
      for (let n = 0; n < N; n++) {
          sum += signal[n] * Math.cos((Math.PI / N) * k * (n + 0.5));
      }
      result[k] = sum * Math.sqrt(2 / N);
  }
  result[0] = result[0] / Math.sqrt(2);
  return result;
}

function hzToMel(hz) {
  return 2595 * Math.log10(1 + hz / 700);
}

function melToHz(mel) {
  return 700 * (10 ** (mel / 2595) - 1);
}

function createMelFilterbanks(numFilterbanks, fftSize, sampleRate) {
  const lowFreqMel = hzToMel(0);
  const highFreqMel = hzToMel(sampleRate / 2);
  
  // Spacing of filterbanks on Mel scale
  const melPoints = Array.from({ length: numFilterbanks + 2 }, (v, i) =>
    melToHz(lowFreqMel + (i * (highFreqMel - lowFreqMel)) / (numFilterbanks + 1))
  );

  // Convert Mel points back to frequency domain and to nearest FFT bin
  const bins = melPoints.map(f => Math.floor((fftSize + 1) * f / sampleRate));

  const filterbanks = Array.from({ length: numFilterbanks }, () => new Array(fftSize / 2).fill(0));

  for (let m = 1; m <= numFilterbanks; m++) {
    for (let k = bins[m - 1]; k < bins[m]; k++) {
      filterbanks[m - 1][k] = (k - bins[m - 1]) / (bins[m] - bins[m - 1]);
    }
    for (let k = bins[m]; k < bins[m + 1]; k++) {
      filterbanks[m - 1][k] = (bins[m + 1] - k) / (bins[m + 1] - bins[m]);
    }
  }

  return filterbanks;
}

function applyMelFilterbanks(dataArray, filterbanks) {
  return filterbanks.map(filterbank =>
    dataArray.reduce((sum, value, index) => sum + value * filterbank[index], 0)
  );
}


const WaterfallVisualizer = ({ mediaStream, visualizationType, showLogVis, width = 600, height = 512 }) => {
  const canvasRef = useRef(null);
  const drawVisual = useRef(null);
  

  useEffect(() => {
    if (!mediaStream) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(mediaStream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.fftSize;
    let fftBuffer = new Float32Array(bufferLength/2).fill(0);
    let fftByteBuffer = new Uint8Array(bufferLength/2).fill(0);
    const fullBuffer = new Uint8Array(bufferLength).fill(0);

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
        analyser.getByteTimeDomainData(fullBuffer);
        // Draw each sample as a point on the right edge
        for (let i = 0; i < fullBuffer.length; i++) {
          const value = fullBuffer[i];
          const intensity = Math.abs((value-128) / 128);
          ctx.fillStyle = `rgb(${intensity * 255},${intensity * 255},${intensity * 255})`;
          const y = height - (i / fullBuffer.length) * height;
          ctx.fillRect(width - 1, y, 1, 2*height/(fullBuffer.length));
        }
      } else if (visualizationType === 'frequencySpectrum') {
        analyser.getByteFrequencyData(fftByteBuffer);
        let max = 0;
        for (let i = 0; i < fftByteBuffer.length; i++) {
          let value;
          let intensity;
          // the output of the analyser in frequency domain is already in log!
          // therefore we have to invert the log if NOT log vis.
          if (showLogVis === 'True') {
            value = fftByteBuffer[i];
            intensity = value/255.0;
            if (intensity > max)
              max = intensity;
          } else {
            value = (10**(fftByteBuffer[i]/255))/10;
            intensity = value;
            if (intensity > max)
              max = intensity;
          }
          ctx.fillStyle = `rgb(${intensity * 255},${intensity * 255},${intensity * 255})`;
          const y = height - ((i / fftByteBuffer.length) * height);
          ctx.fillRect(width - 1, y, 1, Math.round(height / fftByteBuffer.length));
        }
      }
      else if (visualizationType === 'MelSpectrum') {
        // Frequency data is already in log scale!
        analyser.getByteFrequencyData(fftByteBuffer);
        for (let i=0; i < fftByteBuffer.length; i++) {
          fftBuffer[i] =((10**(fftByteBuffer[i]/255))/10)**2;
        }
        const fftSize = analyser.fftSize;
        const sampleRate = audioContext.sampleRate;
        const numFilterbanks = 24;
        const filterbanks = createMelFilterbanks(numFilterbanks, fftSize, sampleRate);

        const melSpectrum = applyMelFilterbanks(fftBuffer, filterbanks);

        for (let i = 0; i < melSpectrum.length; i++) {
          const intensity = melSpectrum[i];
          ctx.fillStyle = `rgb(${intensity * 255},${intensity * 255},${intensity * 255})`;
          const y = height - ((i / (melSpectrum.length)) * height);
          ctx.fillRect(width - 1, y, 1, Math.round(height / melSpectrum.length));
        } 
      }
      else if (visualizationType === 'MelCepstrum') {
        // Frequency data is already in log scale!
        analyser.getByteFrequencyData(fftByteBuffer);
        for (let i=0; i < fftByteBuffer.length; i++) {
          fftBuffer[i] =((10**(fftByteBuffer[i]/255))/10)**2;
        }
        const fftSize = analyser.fftSize;
        const sampleRate = audioContext.sampleRate;
        const numFilterbanks = 24;
        const filterbanks = createMelFilterbanks(numFilterbanks, fftSize, sampleRate);

        const melSpectrum = applyMelFilterbanks(fftBuffer, filterbanks);

        const dctBuffer = dct(melSpectrum);
        console.log("dctBuffer.length: "+ dctBuffer.length)

        for (let i = 0; i < dctBuffer.length; i++) {
          const intensity = dctBuffer[i];
          ctx.fillStyle = `rgb(${intensity * 255},${intensity * 255},${intensity * 255})`;
          const y = height - ((i / (dctBuffer.length)) * height);
          ctx.fillRect(width - 1, y, 1, Math.round(height / dctBuffer.length));
        } 
      }
      else if (visualizationType === 'MelCepstrumLiftered') {
        // Frequency data is already in log scale!
        analyser.getByteFrequencyData(fftByteBuffer);
        for (let i=0; i < fftByteBuffer.length; i++) {
          fftBuffer[i] =((10**(fftByteBuffer[i]/255))/10)**2;
        }
        const fftSize = analyser.fftSize;
        const sampleRate = audioContext.sampleRate;
        const numFilterbanks = 24;
        const filterbanks = createMelFilterbanks(numFilterbanks, fftSize, sampleRate);

        const melSpectrum = applyMelFilterbanks(fftBuffer, filterbanks);

        const dctBuffer = dct(melSpectrum).slice(0,13);
        console.log("dctBuffer.length: "+ dctBuffer.length)

        for (let i = 0; i < dctBuffer.length; i++) {
          const intensity = dctBuffer[i];
          ctx.fillStyle = `rgb(${intensity * 255},${intensity * 255},${intensity * 255})`;
          const y = height - ((i / (dctBuffer.length)) * height);
          ctx.fillRect(width - 1, y, 1, Math.round(height / dctBuffer.length));
        } 
      }
    };

    draw();
    return () => cancelAnimationFrame(drawVisual.current);
  }, [mediaStream, visualizationType, showLogVis, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};

export default WaterfallVisualizer;
