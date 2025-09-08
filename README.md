# ColorNoise - Ambient Sound Generator

A modern, scientifically-accurate colored noise generator built with vanilla JavaScript and the Web Audio API. Generate pink, brown, white, green, and blue noise with ocean-like ambiance effects for focus, relaxation, and sleep.

## Features

### 🎵 Scientifically Accurate Noise Generation
- **Pink Noise**: 1/f power distribution (-3dB per octave) - Perfect for focus and concentration
- **Brown Noise**: 1/f² power distribution (-6dB per octave) - Deep, warm, rumbling sounds
- **White Noise**: Flat power distribution - Classic full-spectrum noise
- **Green Noise**: Mid-frequency emphasis - Optimized for relaxation
- **Blue Noise**: High-frequency emphasis (+3dB per octave) - Energizing and alerting

### 🌊 Advanced Audio Processing
- Real-time convolution reverb with synthetic ocean-like impulse responses
- Multi-band filtering for frequency sculpting
- Spatial audio processing for immersive soundscapes
- Dynamic compression for consistent levels
- Low-frequency enhancement for depth and richness

### ⏰ Smart Timer System
- Preset durations: 15min, 30min, 1hr, or custom times
- Automatic fade-out in the last 30 seconds
- Infinite playback mode
- Timer pause/resume functionality

### 🎛️ Intuitive Controls
- One-click noise type switching
- Smooth volume control with exponential scaling
- Fade in/out transitions for comfortable listening
- Visual feedback and status indicators
- Keyboard shortcuts for quick control

### 📱 Responsive Design
- Mobile-optimized interface
- Touch-friendly controls
- Cross-browser compatibility
- Progressive Web App ready

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Audio**: Web Audio API with advanced signal processing
- **Design**: Modern CSS with flexbox/grid, responsive design principles
- **Deployment**: Static hosting (Cloudflare Pages ready)

## Getting Started

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/jacksoneyton/ColorNoise.git
   cd ColorNoise
   ```

2. Serve the files using any static server:
   ```bash
   # Using Python (built-in)
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server
   
   # Using PHP (built-in)
   php -S localhost:8000
   ```

3. Open `http://localhost:8000` in your browser

### Deployment to Cloudflare Pages

1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: `echo "Static site - no build required"`
3. Set output directory: `/`
4. Deploy automatically on push to main branch

## Usage

### Basic Controls
- **Space**: Toggle play/pause
- **1-5**: Switch between noise types (Pink, Brown, White, Green, Blue)
- **↑/↓ Arrow Keys**: Adjust volume

### Noise Types Explained

| Type | Characteristics | Best For |
|------|----------------|----------|
| **Pink** | Balanced frequency response, natural sound | Focus, studying, general background |
| **Brown** | Deep, rumbling, bass-heavy | Deep relaxation, sleep, meditation |
| **White** | Equal energy across frequencies | Masking distractions, concentration |
| **Green** | Mid-frequency emphasis | Stress relief, calm focus |
| **Blue** | High-frequency emphasis | Alertness, countering low-frequency noise |

### Audio Processing

The app applies sophisticated audio effects to create rich, immersive soundscapes:

1. **Noise Generation**: Mathematically accurate algorithms for each color type
2. **Convolution Reverb**: Synthetic impulse responses simulating ocean environments
3. **Frequency Sculpting**: Multi-band filtering to enhance naturalness
4. **Spatial Processing**: Stereo width and positioning for immersion
5. **Dynamic Control**: Compression and limiting for consistent levels

## Architecture

### Core Components

- **`NoiseGenerator.js`**: Web Audio API-based noise synthesis with scientific accuracy
- **`AudioEffects.js`**: Advanced audio processing pipeline for ambiance
- **`TimerManager.js`**: Smart timer system with fade-out functionality
- **`app.js`**: Main application controller and UI coordination

### Audio Graph Architecture

```
[Noise Generator] → [Audio Effects] → [Output]
                        ↓
    [Reverb] + [Filtering] + [Compression] + [Spatial]
```

## Browser Compatibility

- **Chrome/Edge**: Full support with all features
- **Firefox**: Full support with all features  
- **Safari**: Full support (requires user gesture for audio)
- **Mobile browsers**: Optimized experience with touch controls

## Performance

- **Memory**: ~5-10MB typical usage
- **CPU**: Minimal impact with optimized audio processing
- **Battery**: Efficient audio generation with minimal device drain
- **Latency**: <50ms audio latency for responsive controls

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with proper testing
4. Commit with descriptive messages
5. Push and create a Pull Request

### Development Guidelines

- Follow existing code style and patterns
- Add comprehensive comments for audio processing code
- Test across multiple browsers and devices
- Ensure accessibility compliance
- Optimize for performance and battery life

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Web Audio API specification and browser implementations
- Scientific research on colored noise characteristics
- Community feedback and contributions

---

**Live Demo**: [ColorNoise App](https://colornoise.pages.dev)
**Repository**: [GitHub](https://github.com/jacksoneyton/ColorNoise)