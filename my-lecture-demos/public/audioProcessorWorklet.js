// In public/audioProcessorWorklet.js
class BasicProcessor extends AudioWorkletProcessor {
    process(inputs) {
      // Assuming mono input for simplicity
      const input = inputs[0];
      if (input && input.length > 0) {
        const inputData = input[0];
        // Post the audio data to the main thread
        this.port.postMessage(inputData);
      }
      return true;
    }
  }
  
  registerProcessor('basic-processor', BasicProcessor);
  