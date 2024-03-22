import tkinter as tk
from tkinter import filedialog
import pyaudio
import wave
import numpy as np
from scipy.signal import fftconvolve
import threading
from numba import jit


@jit(nopython=True)
def direct_convolution(signal, impulse_response):
    """
    Perform convolution directly in the time domain without FFT, optimized with Numba.

    :param signal: The input signal (numpy array).
    :param impulse_response: The impulse response (numpy array).
    :return: The convolved signal (numpy array).
    """
    len_signal = len(signal)
    len_impulse = len(impulse_response)
    output = np.zeros(len_signal + len_impulse - 1, dtype=np.float64)

    for i in range(len_signal):
        for j in range(len_impulse):
            output[i + j] += signal[i] * impulse_response[j]

    return output


class AudioConvolutionTool:
    def __init__(self, master):
        self.master = master
        self.master.title("Audio Convolution Tool")

        self.recording = False
        self.frames = []
        self.impulse_response = None

        self.load_button = tk.Button(
            master,
            text="Load Impulse Response",
            command=self.load_impulse_response)
        self.load_button.pack()

        self.record_button = tk.Button(
            master,
            text="Start Recording",
            command=self.toggle_recording)
        self.record_button.pack()

        self.play_impulse_button = tk.Button(
            master,
            text="Play Impulse Response",
            command=lambda: self.play_audio(
                self.impulse_response))
        self.play_impulse_button.pack()

        self.play_recording_button = tk.Button(
            master, text="Play Recording", command=self.play_recording)
        self.play_recording_button.pack()

        self.play_convolution_button = tk.Button(
            master, text="Play FFTConvolution", command=self.play_convolution)
        self.play_convolution_button.pack()

        self.play_convolution2_button = tk.Button(
            master, text="Play Convolution", command=self.play_convolution2)
        self.play_convolution2_button.pack()

        self.audio_format = pyaudio.paInt16
        self.channels = 1
        self.rate = 44100
        self.frames_per_buffer = 1024
        self.audio_interface = pyaudio.PyAudio()

    def load_impulse_response(self):
        filename = filedialog.askopenfilename(filetypes=(
            ("WAV files", "*.wav"), ("All files", "*.*")))
        if filename:
            with wave.open(filename, 'rb') as wf:
                self.impulse_response = np.frombuffer(
                    wf.readframes(wf.getnframes()), dtype=np.int16)

    def toggle_recording(self):
        if self.recording:
            self.recording = False
            self.record_button.config(text="Start Recording")
        else:
            self.recording = True
            self.record_button.config(text="Stop Recording")
            threading.Thread(target=self.record).start()

    def record(self):
        stream = self.audio_interface.open(
            format=self.audio_format,
            channels=self.channels,
            rate=self.rate,
            input=True,
            frames_per_buffer=self.frames_per_buffer)
        self.frames = []

        while self.recording:
            data = stream.read(self.frames_per_buffer)
            self.frames.append(data)

        stream.stop_stream()
        stream.close()

    def play_audio(self, data):
        def play():
            stream = self.audio_interface.open(
                format=self.audio_format,
                channels=self.channels,
                rate=self.rate,
                output=True)
            stream.write(data.tobytes())
            stream.stop_stream()
            stream.close()

        if data is not None:
            threading.Thread(target=play).start()

    def play_recording(self):
        recorded_data = b''.join(self.frames)
        self.play_audio(np.frombuffer(recorded_data, dtype=np.int16))

    def play_convolution2(self):
        if self.impulse_response is not None and self.frames:
            recorded_data = np.frombuffer(
                b''.join(self.frames), dtype=np.int16)
            # Use direct_convolution here
            convolved_data = direct_convolution(
                recorded_data, self.impulse_response)
            # Normalize the convolved data to prevent clipping and convert back
            # to np.int16.
            convolved_data = np.int16(
                convolved_data /
                np.max(
                    np.abs(convolved_data)) *
                32767)
            self.play_audio(convolved_data)

    def play_convolution(self):
        if self.impulse_response is not None and self.frames:
            recorded_data = np.frombuffer(
                b''.join(self.frames), dtype=np.int16)
            convolved_data = fftconvolve(
                recorded_data, self.impulse_response, mode='same')
            convolved_data = np.int16(
                convolved_data /
                np.max(
                    np.abs(convolved_data)) *
                32767)
            self.play_audio(convolved_data)

    def on_closing(self):
        self.audio_interface.terminate()
        self.master.destroy()


root = tk.Tk()
app = AudioConvolutionTool(root)
root.protocol("WM_DELETE_WINDOW", app.on_closing)
root.mainloop()
