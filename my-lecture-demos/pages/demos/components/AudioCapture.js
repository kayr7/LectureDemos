import { useEffect } from 'react';

export default function AudioCapture({ setMediaStream }) {
    useEffect(() => {
      async function getMedia() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setMediaStream(stream);
        } catch (err) {
          console.error('Error accessing the microphone', err);
        }
      }
      getMedia();
    }, [setMediaStream]);
  
    return null; // This component does not render anything
}
  