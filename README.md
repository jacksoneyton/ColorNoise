# ColorNoise

Procedural sound design tool implementing scientifically-accurate colored noise generation with comprehensive audio processing capabilities. Built with vanilla JavaScript and the Web Audio API.

## Core Features

### Interface Architecture
- Circular control interface designed for professional audio workflow
- Eight noise type generators: White, Pink, Brown, Blue, Violet, Gray, Red, Green
- Real-time frequency spectrum analysis with visual feedback
- Profile management system with export/import functionality
- Centralized preset database with community contribution pipeline

### Audio Control System
- 10-band parametric equalizer spanning 40Hz to 16kHz
- Dual control methodology: continuous sliders with discrete numerical input
- Six-stage audio effects processing chain
- Bidirectional control synchronization across interface elements

### Signal Processing
- Automatic gain compensation to prevent digital clipping
- Soft limiting using hyperbolic tangent saturation curves
- Continuous procedural generation eliminating buffer loops
- Professional signal chain: Noise Generation → EQ → Reverb → Warmth → Saturation → Spatial → Compression → Limiting

### Noise Generation Algorithms
- **White**: Uniform power spectral density across frequency spectrum
- **Pink**: 1/f power distribution with -3dB/octave rolloff
- **Brown**: 1/f² power distribution with -6dB/octave rolloff
- **Blue**: High-frequency emphasis with +3dB/octave slope
- **Violet**: Second-order high-pass filtering characteristics
- **Gray**: A-weighted frequency response curve implementation
- **Red**: Extended low-frequency content below brown noise spectrum
- **Green**: Mid-frequency emphasis optimized for perceptual balance

## Implementation Details

### Technology Stack
- **Runtime**: Vanilla JavaScript ES6+ modules
- **Audio Processing**: Web Audio API with ScriptProcessorNode implementation
- **Interface**: HTML5/CSS3 with flexbox layout system
- **Deployment**: Static file hosting compatible (Cloudflare Pages)

### Installation and Deployment

```bash
# Repository setup
git clone https://github.com/jacksoneyton/ColorNoise.git
cd ColorNoise

# Local development server
python -m http.server 8000
# Access via http://localhost:8000

# Production deployment
# Push to main branch for automatic Cloudflare Pages deployment
```

## System Architecture

### Interface Components
- **Audio Control**: Central play/pause state management
- **Noise Selection**: Circular layout providing access to eight noise generators
- **Frequency Control**: 10-band parametric equalizer with logarithmic frequency spacing
- **Effects Processing**: Six-parameter effects chain with percentage-based control
- **Configuration Management**: Profile export/import with JSON serialization
- **Preset System**: Database-driven preset selection with automatic loading
- **Spectrum Analysis**: Real-time FFT visualization with frequency binning

### Control Parameters
- **Equalizer**: ±30dB gain adjustment across 10 frequency bands (40Hz-16kHz)
- **Effects**: Normalized 0-100% intensity scaling for six processing stages
- **Audio Pipeline**: Configurable routing with bypass capability per effect
- **State Management**: Complete system state serialization for profile storage
- **Preset Database**: JSON-structured preset collection with metadata
- **Community Integration**: Form-based submission system for preset sharing

### Audio Processing Chain
```
Noise Generator → 10-Band EQ → Reverb → Warmth → Saturation → Spatial → Compression → Soft Limiter → Output
```

## Code Architecture

### Module Structure
- **`index.html`**: Primary interface with integrated preset system
- **`sound_designer.html`**: Advanced interface with circular control layout
- **`sound_designer_engine.js`**: Core audio processing engine
- **`js/preset-loader.js`**: Preset management and database interface
- **`Presets/presets.json`**: Centralized preset database
- **Database utilities**: Node.js scripts for preset lifecycle management

### Audio Engine Implementation
- **Buffer Management**: 4096-sample processing blocks for optimized latency
- **Filter Implementation**: Biquad filter cascade with shelving and peaking topologies
- **Effects Processing**: Convolution reverb, nonlinear saturation, dynamic range compression
- **Protection Systems**: Automatic gain compensation and soft limiting algorithms
- **Database Integration**: JSON-based preset storage with automatic synchronization
- **Management Interface**: Command-line tools for database operations

## Platform Compatibility

### Browser Support Matrix
- **Chromium-based**: Complete Web Audio API support with all features
- **Firefox**: Full compatibility across all audio processing features
- **Safari**: Complete support with user gesture requirement for AudioContext
- **Mobile Browsers**: Responsive interface with touch-optimized controls

### Performance Characteristics
- **Audio Generation**: Continuous procedural synthesis without sample buffers
- **Processing Latency**: <50ms response time for real-time parameter changes
- **CPU Utilization**: Optimized algorithms for minimal processing overhead
- **Memory Footprint**: ~10-15MB including spectrum analysis buffers

## Development Guidelines

### Code Contribution Process
1. Fork repository and create feature branch from main
2. Implement changes with cross-browser compatibility testing
3. Maintain existing code patterns and architectural consistency
4. Submit pull request with comprehensive change documentation

### Preset Contribution Workflow
1. Configure audio parameters through interface controls
2. Submit configuration via integrated Google Forms interface
3. Maintainer review and approval process for database inclusion
4. Attribution provided in preset metadata upon acceptance

### Database Management Operations
```bash
# Preset lifecycle management
node add-preset.js <preset_id> "<display_name>"    # Create new preset
node sync-presets.js                               # Synchronize database
node remove-preset.js <preset_id>                  # Remove existing preset
```

## License

MIT License - See [LICENSE](LICENSE) file for details.

---

**Repository**: https://github.com/jacksoneyton/ColorNoise
**Production**: https://colornoise.pages.dev
**Documentation**: Complete technical reference available in CLAUDE.md