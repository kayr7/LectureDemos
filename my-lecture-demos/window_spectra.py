import numpy as np
import matplotlib.pyplot as plt
from scipy.fft import fft
from scipy.signal import windows

# Function to plot a window and its spectrum
def plot_window_and_spectrum(window_func, N, title):
    fig, axs = plt.subplots(1, 2, figsize=(14, 4))
    
    # Window in time domain
    window = window_func(N)
    axs[0].plot(window)
    axs[0].set_title(f'{title} Window')
    axs[0].set_xlabel('Sample')
    axs[0].set_ylabel('Amplitude')
    
    # Spectrum
    spectrum = fft(window, 2048) / N
    frequency = np.linspace(0, 1, len(spectrum))
    magnitude = 20 * np.log10(np.abs(spectrum) / np.abs(spectrum).max())
    axs[1].plot(frequency, magnitude)
    axs[1].set_title(f'{title} Spectrum')
    axs[1].set_xlabel('Normalized Frequency')
    axs[1].set_ylabel('Magnitude (dB)')
    axs[1].set_xlim(0, 0.5)
    axs[1].set_ylim(-100, 0)
    
    plt.tight_layout()
    plt.show()

# Number of samples
N = 512

# Plot different windows and their spectra
plot_window_and_spectrum(lambda x: windows.hamming(x), N, 'Hamming')
plot_window_and_spectrum(lambda x: windows.hann(x), N, 'Hann')
plot_window_and_spectrum(lambda x: windows.blackman(x), N, 'Blackman')

# Modified Rectangular Window to have non-zero values only in the middle
plot_window_and_spectrum(lambda x: np.pad(np.ones(x//2), (x//4, x//4), 'constant'), N, 'Rectangular (Middle)')

# Correct Dirac Impulse representation
plot_window_and_spectrum(lambda x: np.pad([1], (x//2, x//2-1), 'constant'), N, 'Dirac Impulse')
