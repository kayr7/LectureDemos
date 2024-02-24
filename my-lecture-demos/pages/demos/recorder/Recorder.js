import React, { useState, useEffect, useRef } from 'react';

const Recorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Initialize audio context and analyser
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 2048;
  }, []);

  const startRecording = async () => {
    // Request access to the microphone
    mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(mediaStreamRef.current);
    setMediaRecorder(recorder);

    recorder.ondataavailable = (event) => {
      setAudioData(event.data);
    };

    recorder.start();
    setIsRecording(true);

    // Connect the media stream to the analyser
    const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
    source.connect(analyserRef.current);
    drawWaveform();
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setIsRecording(false);
    cancelAnimationFrame(animationRef.current);
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyserRef.current.getByteTimeDomainData(dataArray);

      ctx.fillStyle = 'rgb(255, 255, 255)';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgb(0, 0, 0)';
      ctx.beginPath();

      let sliceWidth = width * 1.0 / bufferLength;
      let x = 0;

      for(let i = 0; i < bufferLength; i++) {
        let v = dataArray[i] / 128.0; // Byte array values are from 0 to 255
        let y = v * height / 2;

        if(i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };

  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <canvas ref={canvasRef} width="500" height="100" />
    </div>
  );
};

export default Recorder;
