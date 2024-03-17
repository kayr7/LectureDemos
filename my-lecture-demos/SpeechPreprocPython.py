import sys
import numpy as np
import pyaudio
from PyQt5.QtWidgets import QApplication, QMainWindow, QPushButton, QVBoxLayout, QWidget, QCheckBox
from PyQt5.QtCore import QThread, pyqtSignal
from PyQt5.QtCore import QTimer
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure

class AudioStreamThread(QThread):
    data_signal = pyqtSignal(np.ndarray)

    def __init__(self):
        super().__init__()
        self.stream = None
        self.pyaudio_instance = pyaudio.PyAudio()
        self.running = False

    def run(self):
        self.stream = self.pyaudio_instance.open(format=pyaudio.paFloat32,
                                                 channels=1,
                                                 rate=22050,
                                                 input=True,
                                                 frames_per_buffer=512,
                                                 stream_callback=self.callback)
        self.stream.start_stream()
        self.running = True
        while self.running:
            self.msleep(50)  # Reduce CPU usage
        self.stream.stop_stream()
        self.stream.close()
        self.pyaudio_instance.terminate()

    def callback(self, in_data, frame_count, time_info, status):
        audio_data = np.frombuffer(in_data, dtype=np.float32)
        self.data_signal.emit(audio_data)
        return (in_data, pyaudio.paContinue)

    def stop(self):
        self.running = False
        self.wait()

class AudioVisualizer(QMainWindow):
    def __init__(self):
        super().__init__()
        self.fft_audio_image = np.zeros((100, 256))  # Adjust the size as needed
        self.display_fft_audio = True  # Control for displaying FFT audio
        self.display_raw_audio = True

        self.use_hamming_window = True  # Default to true or false as you prefer
        self.use_log_scale = True  # Attribute to control the logarithmic scale application

        # Initialize raw_audio_image here
        self.raw_audio_image = np.zeros((100, 256))  # Placeholder image with 100 rows and 256 columns
        self.initUI()
        self.audio_thread = AudioStreamThread()
        self.audio_thread.data_signal.connect(self.process_audio_data)
        self.update_timer = QTimer(self)
        self.update_timer.timeout.connect(self.update_visualizations)
        self.update_timer.start(20)  # Update every 100 ms

        self.audio_data_buffer = []

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

        self.setCentralWidget(self.main_widget)
        self.show()

    def toggle_log_scale(self, state):
        self.use_log_scale = bool(state)

    def toggle_hamming_window(self, state):
        self.use_hamming_window = bool(state)


    def toggle_audio_capture(self):
        if self.audio_thread.isRunning():
            self.audio_thread.stop()
            self.toggle_audio_btn.setText('Start Audio Capture')
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
        print(np.max(power_spectrum))
        column = power_spectrum# / np.max(power_spectrum)  # Normalize
        self.fft_audio_image = np.roll(self.fft_audio_image, -1, axis=1)
        self.fft_audio_image[:, -1] = column.flatten()[:100]  # Adjust length if necessary
        
        self.ax_fft_audio.clear()
        self.ax_fft_audio.imshow(self.fft_audio_image, aspect='auto', cmap='viridis')
        self.ax_fft_audio.axis('off')
        self.fft_audio_figure.draw()



if __name__ == '__main__':
    app = QApplication(sys.argv)
    ex = AudioVisualizer()
    sys.exit(app.exec_())
