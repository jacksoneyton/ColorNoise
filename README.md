# ColorNoise - Procedural Sound Designer

A professional-grade procedural sound design tool featuring scientifically-accurate colored noise generation with comprehensive audio processing capabilities. Built with vanilla JavaScript and the Web Audio API.

## Features

### 🎨 Professional Sound Designer Interface
- **Circular UI**: Intuitive wheel-based design inspired by professional audio equipment
- **8 Noise Types**: White, Pink, Brown, Blue, Violet, Gray, Red, and Green noise
- **Real-time Spectrum Analyzer**: Visual frequency analysis with colorful display
- **Profile System**: Export/import custom sound profiles with user-defined names

### 🎛️ Precision Audio Controls
- **10-Band Equalizer**: Professional frequency shaping from 40Hz to 16kHz
- **Dual Input Methods**: Both sliders and numerical inputs for precise control
- **6 Audio Effects**: Reverb, Spatial Width, Warmth Filter, Saturation, Dynamics, Modulation
- **Bidirectional Sync**: Sliders and number inputs stay perfectly synchronized

### 🔊 Advanced Audio Processing
- **Automatic Gain Compensation**: Prevents clipping during heavy EQ boosting
- **Soft Limiting**: Professional-grade audio protection using hyperbolic tangent curves
- **Real-time Generation**: Continuous procedural audio without loops or samples
- **Professional Effects Chain**: Reverb → Warmth → Saturation → Spatial → Compression → Limiting

### 🎵 Scientifically Accurate Noise Types
- **White**: Flat power distribution across all frequencies
- **Pink**: 1/f distribution (-3dB/octave) - Natural, balanced sound
- **Brown**: 1/f² distribution (-6dB/octave) - Deep, warm rumbling
- **Blue**: High-frequency emphasis (+3dB/octave) - Crisp and energizing
- **Violet**: Second-order high-pass characteristics - Sharp, bright
- **Gray**: A-weighted frequency response - Perceptually flat
- **Red**: Ultra-low frequencies - Deeper than brown noise
- **Green**: Mid-frequency emphasis - Optimized for relaxation

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Audio**: Web Audio API with advanced signal processing
- **Design**: Modern CSS with flexbox/grid, responsive design principles
- **Deployment**: Static hosting (Cloudflare Pages ready)

## Getting Started

### Quick Start

1. **Clone and Run**:
   ```bash
   git clone https://github.com/jacksoneyton/ColorNoise.git
   cd ColorNoise
   python -m http.server 8000  # Or use any static server
   ```

2. **Open**: Navigate to `http://localhost:8000/sound_designer.html`

3. **Use**: Click the center play button, select noise types around the wheel, adjust EQ and effects

## Usage Guide

### Interface Overview
- **Center Play Button**: Start/stop audio generation
- **Noise Type Ring**: 8 noise types positioned around the central wheel
- **Left Panel**: 10-band equalizer with frequency-specific controls
- **Right Panel**: 6 audio effects with intensity controls
- **Top Right**: Profile export/import buttons
- **Bottom**: Real-time spectrum analyzer

### Professional Controls
- **Dual Input**: Use sliders for sweeping changes or number inputs for precise values
- **EQ Range**: ±30dB adjustment across 10 frequency bands
- **Effects Range**: 0-100% intensity for all audio effects
- **Profile System**: Save/load complete configurations with custom names

### Audio Processing Chain
```
Noise Generator → 10-Band EQ → Reverb → Warmth → Saturation → Spatial → Compression → Soft Limiter → Output
```

## Technical Architecture

### Core Files
- **`sound_designer.html`**: Complete UI with circular controls and precision inputs
- **`sound_designer_engine.js`**: Comprehensive audio engine with Web Audio API
- **Legacy files**: Original ambient sound generator (`app.js`, `NoiseGenerator.js`, `AudioEffects.js`)

### Audio Engine Features
- **Real-time Processing**: 4096-sample buffers for low-latency audio generation
- **Professional EQ**: 10 biquad filters with shelving and peaking responses
- **Effect Processing**: Convolution reverb, waveshaping saturation, dynamics compression
- **Safety Systems**: Automatic gain compensation and soft limiting prevent audio damage

## Browser Support

- **Chrome/Edge/Firefox**: Full support with all features
- **Safari**: Full support (requires user interaction to start audio)
- **Mobile**: Responsive design with touch-optimized controls

## Performance

- **Real-time Generation**: No pre-recorded samples, infinite duration
- **Low Latency**: <50ms audio response for immediate control feedback  
- **Efficient Processing**: Optimized algorithms minimize CPU usage
- **Memory Usage**: ~10-15MB typical usage including spectrum analyzer

## Contributing

1. Fork the repository and create a feature branch
2. Make changes with comprehensive testing across browsers
3. Follow existing code patterns and add clear documentation
4. Submit a pull request with detailed description

## License

MIT License - See [LICENSE](LICENSE) file for details.

---

**Repository**: [GitHub - ColorNoise](https://github.com/jacksoneyton/ColorNoise)  
**Main Tool**: Open `sound_designer.html` for the full professional interface