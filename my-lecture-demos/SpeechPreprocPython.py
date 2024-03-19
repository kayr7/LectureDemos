import sys
import numpy as np
import pyaudio
from PyQt5.QtWidgets import QApplication, QMainWindow, QPushButton, QVBoxLayout, QWidget, QCheckBox
from PyQt5.QtCore import QThread, pyqtSignal
from PyQt5.QtCore import QTimer
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure
from scipy.fftpack import dct


class AudioStreamThread(QThread):
    data_signal = pyqtSignal(np.ndarray)

    def __init__(self):
        super().__init__()
        self.pyaudio_instance = pyaudio.PyAudio()
        self.stream = None
        self.running = False

    def run(self):
        self.running = True
        self.initialize_stream()

        while self.running:
            self.msleep(50)

        self.close_stream()

    def initialize_stream(self):
        if self.stream is not None:
            # Stream exists, close before re-initializing
            self.close_stream()

        self.stream = self.pyaudio_instance.open(format=pyaudio.paFloat32,
                                                 channels=1,
                                                 rate=22050,
                                                 input=True,
                                                 frames_per_buffer=512,
                                                 stream_callback=self.callback)
        self.stream.start_stream()

    def close_stream(self):
        if self.stream is not None:
            self.stream.stop_stream()
            self.stream.close()
        self.stream = None

    def callback(self, in_data, frame_count, time_info, status):
        audio_data = np.frombuffer(in_data, dtype=np.float32)
        self.data_signal.emit(audio_data)
        return (in_data, pyaudio.paContinue)

    def stop(self):
        self.running = False
        self.wait()
        self.close_stream()
        

    def __del__(self):
        self.pyaudio_instance.terminate()

class AudioVisualizer(QMainWindow):
    def __init__(self):
        super().__init__()
        self.fft_audio_image = np.zeros((100, 256))  # Adjust the size as needed
        self.display_fft_audio = True  # Control for displaying FFT audio
        self.display_raw_audio = True

        self.use_hamming_window = True  # Default to true or false as you prefer
        self.use_log_scale = True  # Attribute to control the logarithmic scale application



        self.mel_spectrum_image = np.zeros((100, 256))  # Placeholder image
        self.display_mel_spectrum = True  # Control for displaying Mel spectrum

        # Initialize raw_audio_image here
        self.raw_audio_image = np.zeros((100, 256))  # Placeholder image with 100 rows and 256 columns

        self.dct_mel_image = np.zeros((100, 256))
        self.display_dct_mel = True

        self.use_liftering = True

        self.initUI()
        self.audio_thread = AudioStreamThread()
        self.audio_thread.data_signal.connect(self.process_audio_data)
        self.update_timer = QTimer(self)
        self.update_timer.timeout.connect(self.update_visualizations)
        self.update_timer.start(20)  # Update every 100 ms

        self.audio_data_buffer = []
        self.saved_blocks = []
        self.projection_matrix = np.load('./projection.npy')

    def initUI(self):
        self.setWindowTitle('Audio Signal Processing Visualizer')
        self.main_widget = QWidget(self)
        self.layout = QVBoxLayout(self.main_widget)

        self.toggle_audio_btn = QPushButton('Toggle Audio Capture', self)
        self.toggle_audio_btn.clicked.connect(self.toggle_audio_capture)
        self.layout.addWidget(self.toggle_audio_btn)

        self.raw_audio_checkbox = QCheckBox("Show Raw Audio", self)
        self.raw_audio_checkbox.setChecked(True)
        self.raw_audio_checkbox.stateChanged.connect(self.toggle_raw_audio)
        self.layout.addWidget(self.raw_audio_checkbox)

        self.raw_audio_figure = FigureCanvas(Figure())
        self.layout.addWidget(self.raw_audio_figure)
        self.ax_raw_audio = self.raw_audio_figure.figure.subplots()
        self.ax_raw_audio.set_title("Raw Audio")
        self.ax_raw_audio.imshow(self.raw_audio_image, aspect='auto', cmap='viridis')
        self.ax_raw_audio.axis('off')

        # Add a checkbox for toggling the use of logarithmic scale
        self.log_scale_checkbox = QCheckBox("Use Log Scale for FFT", self)
        self.log_scale_checkbox.setChecked(self.use_log_scale)
        self.log_scale_checkbox.stateChanged.connect(self.toggle_log_scale)
        self.layout.addWidget(self.log_scale_checkbox)

        self.hamming_window_checkbox = QCheckBox("Use Hamming Window", self)
        self.hamming_window_checkbox.setChecked(self.use_hamming_window)
        self.hamming_window_checkbox.stateChanged.connect(self.toggle_hamming_window)
        self.layout.addWidget(self.hamming_window_checkbox)

# Checkbox for toggling FFT audio visualization
        self.fft_audio_checkbox = QCheckBox("Show FFT Audio", self)
        self.fft_audio_checkbox.setChecked(True)
        self.fft_audio_checkbox.stateChanged.connect(self.toggle_fft_audio)
        self.layout.addWidget(self.fft_audio_checkbox)
        
        # Placeholder for FFT audio visualization
        self.fft_audio_figure = FigureCanvas(Figure())
        self.layout.addWidget(self.fft_audio_figure)
        self.ax_fft_audio = self.fft_audio_figure.figure.subplots()
        self.ax_fft_audio.set_title("FFT Audio")
        self.ax_fft_audio.imshow(self.fft_audio_image, aspect='auto', cmap='viridis')
        self.ax_fft_audio.axis('off')


        # Add a checkbox for toggling Mel spectrum visualization
        self.mel_spectrum_checkbox = QCheckBox("Show Mel Spectrum", self)
        self.mel_spectrum_checkbox.setChecked(self.display_mel_spectrum)
        self.mel_spectrum_checkbox.stateChanged.connect(self.toggle_mel_spectrum)
        self.layout.addWidget(self.mel_spectrum_checkbox)

        # Placeholder for Mel spectrum visualization
        self.mel_spectrum_figure = FigureCanvas(Figure())
        self.layout.addWidget(self.mel_spectrum_figure)
        self.ax_mel_spectrum = self.mel_spectrum_figure.figure.subplots()
        self.ax_mel_spectrum.set_title("Mel Spectrum")
        self.ax_mel_spectrum.imshow(self.mel_spectrum_image, aspect='auto', cmap='viridis')
        self.ax_mel_spectrum.axis('off')




        self.dct_mel_checkbox = QCheckBox("Show DCT of Mel Spectrum", self)
        self.dct_mel_checkbox.setChecked(self.display_dct_mel)
        self.dct_mel_checkbox.stateChanged.connect(self.toggle_dct_mel)
        self.layout.addWidget(self.dct_mel_checkbox)
        self.liftering_checkbox = QCheckBox("Use Liftering", self)
        self.liftering_checkbox.setChecked(self.use_liftering)
        self.liftering_checkbox.stateChanged.connect(self.toggle_liftering)
        self.layout.addWidget(self.liftering_checkbox) 
        # Placeholder for DCT Mel Spectrum Visualization
        self.dct_mel_figure = FigureCanvas(Figure())
        self.layout.addWidget(self.dct_mel_figure)
        self.ax_dct_mel = self.dct_mel_figure.figure.subplots()
        self.ax_dct_mel.set_title("DCT of Mel Spectrum")
        self.ax_dct_mel.imshow(self.dct_mel_image, aspect='auto', cmap='viridis')
        self.ax_dct_mel.axis('off')


        self.setCentralWidget(self.main_widget)
        self.show()

    def toggle_log_scale(self, state):
        self.use_log_scale = bool(state)

    def toggle_hamming_window(self, state):
        self.use_hamming_window = bool(state)

    def toggle_liftering(self, state):
        self.use_liftering = bool(state)

    def toggle_audio_capture(self):
        if self.audio_thread.isRunning():
            self.audio_thread.stop()
            self.toggle_audio_btn.setText('Start Audio Capture')
            #if len(self.saved_blocks) > 500:
            #    array = np.array(self.saved_blocks)
            #    np.save('./samples.npy', array)
        else:
            self.audio_thread.start()
            self.toggle_audio_btn.setText('Stop Audio Capture')

    def toggle_raw_audio(self, state):
        self.display_raw_audio = bool(state)
        if not self.display_raw_audio:
            self.ax_raw_audio.clear()
            self.ax_raw_audio.axis('off')
            self.raw_audio_figure.draw()

    def toggle_fft_audio(self, state):
        self.display_fft_audio = bool(state)
        if not self.display_fft_audio:
            self.ax_fft_audio.clear()
            self.ax_fft_audio.axis('off')
            self.fft_audio_figure.draw()

    def toggle_mel_spectrum(self, state):
        self.display_mel_spectrum = bool(state)
        if not self.display_mel_spectrum:
            self.ax_mel_spectrum.clear()
            self.ax_mel_spectrum.axis('off')
            self.mel_spectrum_figure.draw()

    def toggle_dct_mel(self, state):
        self.display_dct_mel = bool(state)

    def update_mel_spectrum_visualization(self, mel_spectrum):
        # Assuming mel_spectrum is already computed and normalized
        self.mel_spectrum_image = np.roll(self.mel_spectrum_image, -1, axis=1)
        self.mel_spectrum_image[:, -1] = mel_spectrum.flatten()[:100]

        self.ax_mel_spectrum.clear()
        self.ax_mel_spectrum.imshow(self.mel_spectrum_image, aspect='auto', cmap='viridis')
        self.ax_mel_spectrum.axis('off')
        self.mel_spectrum_figure.draw()

    def process_audio_data(self, data):
        # Buffer incoming data
        self.audio_data_buffer.append(data)


    def update_visualizations(self):
        if not self.audio_data_buffer:
            return

        data = np.concatenate(self.audio_data_buffer)
        self.audio_data_buffer.clear()

        if self.display_raw_audio:
            self.update_raw_audio_visualization(data)

        fft_data = self.compute_fft(data)

        if self.display_fft_audio:
            self.update_fft_audio_visualization(fft_data)


        fft_data = self.compute_mel_spectrum(fft_data)
        if self.display_mel_spectrum:
            self.update_mel_spectrum_visualization(fft_data)

        # Compute DCT of Mel Spectrum
        if self.display_dct_mel:
            dct_mel = dct(fft_data, type=2, norm='ortho')
            if self.use_liftering:
                dct_mel = self.apply_lifter(dct_mel)
            self.update_dct_mel_visualization(dct_mel)

        #self.saved_blocks.append(dct_mel)


        


    def compute_mel_spectrum(self, fft_data, sample_rate=22050, n_filters=100, n_fft=512):
        # Generate Mel filter bank
        mel_filters = self.mel_filter_bank(sample_rate, n_filters, n_fft)
        
        # Apply Mel filter bank to the power spectrum (FFT data)
        mel_spectrum = np.dot(mel_filters, fft_data[:n_fft // 2 + 1])
        
        # Convert to dB
        mel_spectrum = 20 * np.log10(np.maximum(mel_spectrum, 1e-10))
        
        return mel_spectrum


    def apply_lifter(self, dct_coefficients, L=22):
        """
        Apply liftering to enhance the high quefrency DCT coefficients.
        
        Parameters:
        - dct_coefficients: The DCT coefficients (cepstral coefficients).
        - L: The liftering parameter.
        
        Returns:
        - The liftered DCT coefficients.
        """
        return np.repeat((dct_coefficients)[1:-49], 2)
        N = len(dct_coefficients)
        n = np.arange(N)
        lifter = 1 + (L / 2) * np.sin(np.pi * n / L)
        return np.repeat((dct_coefficients * lifter)[1:-49], 2)



    def compute_fft(self, data):
        if self.use_hamming_window:
            # Apply the Hamming window
            hamming = np.hamming(len(data))
            data = data * hamming
        
        # Perform FFT
        fft_data = np.fft.rfft(data)
        # Compute power spectrum
        power_spectrum = np.abs(fft_data) ** 2
        
        if self.use_log_scale:
            # Apply logarithmic scale if enabled
            power_spectrum = np.log10(power_spectrum + 1)
        
        return power_spectrum
    
    def mel_filter_bank(self, sample_rate, n_filters, n_fft):
        # Compute Mel points between 0 and the maximum frequency (Nyquist frequency)
        max_mel = 2595 * np.log10(1 + sample_rate / 2 / 700)
        mels = np.linspace(0, max_mel, n_filters + 2)
        hz = 700 * (10**(mels / 2595) - 1)
        
        # Compute FFT bin frequencies
        bin_freqs = np.linspace(0, sample_rate / 2, n_fft // 2 + 1)
        
        # Initialize filter bank
        filters = np.zeros((n_filters, len(bin_freqs)))
        
        # Create filters
        for i in range(1, n_filters + 1):
            left, center, right = hz[i - 1:i + 2]
            filters[i - 1, :] = np.clip((bin_freqs - left) / (center - left), 0, 1) * (bin_freqs <= center) + \
                                np.clip((right - bin_freqs) / (right - center), 0, 1) * (bin_freqs > center)
        
        return filters
    
    def compute_2d_meldct_projection(self, data):
        transformed_data = np.dot(data, self.projection_matrix)
        return transformed_data


    def update_raw_audio_visualization(self, data):
        column = np.abs(data).reshape(-1, 1)
        column = column / np.max(column, axis=0)  # Normalize
        self.raw_audio_image = np.roll(self.raw_audio_image, -1, axis=1)
        self.raw_audio_image[:, -1] = column.flatten()[:100]  # Adjust length if necessary

        self.ax_raw_audio.clear()
        self.ax_raw_audio.imshow(self.raw_audio_image, aspect='auto', cmap='viridis')
        self.ax_raw_audio.axis('off')
        self.raw_audio_figure.draw()

    def update_fft_audio_visualization(self, power_spectrum):
        # Normalize and resize for visualization

        column = power_spectrum / np.max(power_spectrum)  # Normalize
        self.fft_audio_image = np.roll(self.fft_audio_image, -1, axis=1)
        self.fft_audio_image[:, -1] = column.flatten()[:100]  # Adjust length if necessary
        
        self.ax_fft_audio.clear()
        self.ax_fft_audio.imshow(self.fft_audio_image, aspect='auto', cmap='viridis')
        self.ax_fft_audio.axis('off')
        self.fft_audio_figure.draw()


    def update_dct_mel_visualization(self, dct_mel):
        # Normalize for visualization
        dct_mel = np.abs(dct_mel)
        dct_mel = dct_mel / np.max(dct_mel)
        self.dct_mel_image = np.roll(self.dct_mel_image, -1, axis=1)
        self.dct_mel_image[:, -1] = dct_mel.flatten()[:100]
        
        self.ax_dct_mel.clear()
        self.ax_dct_mel.imshow(self.dct_mel_image, aspect='auto', cmap='viridis', vmin=0.0, vmax=1.5)
        self.ax_dct_mel.axis('off')
        self.dct_mel_figure.draw()
    
    def update_mel_spectrum_visualization(self, mel_spectrum):
        # Assuming mel_spectrum is already computed and normalized
        self.mel_spectrum_image = np.roll(self.mel_spectrum_image, -1, axis=1)
        self.mel_spectrum_image[:, -1] = mel_spectrum.flatten()[:100]

        self.ax_mel_spectrum.clear()
        self.ax_mel_spectrum.imshow(self.mel_spectrum_image, aspect='auto', cmap='viridis')
        self.ax_mel_spectrum.axis('off')
        self.mel_spectrum_figure.draw()

if __name__ == '__main__':
    app = QApplication(sys.argv)
    ex = AudioVisualizer()
    sys.exit(app.exec_())
