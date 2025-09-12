/**
 * Procedural Sound Designer Engine
 * Swiss Army Knife for Custom Noise Generation
 */

console.log('Loading sound designer engine...');

class SoundDesignerEngine {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.currentNoiseType = 'white';
        this.iOSUnlocked = false;
        
        // Audio nodes
        this.scriptNode = null;
        this.masterGain = null;
        this.analyser = null;
        
        // 10-Band EQ nodes
        this.eqBands = [];
        this.eqFrequencies = [
            { name: 'subbass', freq: 40, type: 'lowshelf' },
            { name: 'bass', freq: 80, type: 'peaking' },
            { name: 'lowbass', freq: 160, type: 'peaking' },
            { name: 'lowmid', freq: 320, type: 'peaking' },
            { name: 'mid', freq: 640, type: 'peaking' },
            { name: 'uppermid', freq: 1280, type: 'peaking' },
            { name: 'lowtreble', freq: 2560, type: 'peaking' },
            { name: 'treble', freq: 5120, type: 'peaking' },
            { name: 'air', freq: 10240, type: 'peaking' },
            { name: 'ultrahigh', freq: 16000, type: 'highshelf' }
        ];
        
        // Effects nodes
        this.reverbNode = null;
        this.reverbGain = null;
        this.dryGain = null;
        this.spatialPanner = null;
        this.warmthFilter = null;
        this.saturationGain = null;
        this.compressor = null;
        this.modulation = null;
        
        // Noise generation state
        this.noiseStates = {
            brown: { state: 0 },
            pink: { generators: Array(7).fill(0).map(() => Math.random() * 2 - 1), counters: Array(7).fill(0) },
            violet: { state: 0, prev: 0 },
            gray: { state: Array(4).fill(0) },
            red: { state: 0 },
            green: { filterState: Array(6).fill(0) }
        };
        
        // Spectrum analysis
        this.spectrumData = null;
        this.spectrumCanvas = null;
        this.spectrumCtx = null;
        
        this.init();
    }

    async init() {
        // Set up UI event listeners
        this.setupUIEventListeners();
        
        // Initialize spectrum display
        this.initSpectrumDisplay();
        
        // Show mobile notice if on iOS
        this.showMobileNoticeIfNeeded();
        
        console.log('Sound Designer Engine initialized');
    }
    
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    }
    
    showMobileNoticeIfNeeded() {
        if (this.isIOS()) {
            const notice = document.getElementById('mobileNotice');
            if (notice) {
                notice.style.display = 'block';
                console.log('Mobile notice shown for iOS device');
            }
        }
    }
    
    hideMobileNotice() {
        const notice = document.getElementById('mobileNotice');
        if (notice) {
            notice.style.display = 'none';
            console.log('Mobile notice hidden');
        }
    }

    setupUIEventListeners() {
        // Play button event listener - disabled to avoid double firing with onclick
        /*
        const playButton = document.getElementById('playButton');
        if (playButton) {
            playButton.addEventListener('click', () => {
                console.log('Play button clicked!');
                this.togglePlayback();
            });
            console.log('Play button event listener added');
        } else {
            console.error('Play button not found!');
        }
        */
        
        // EQ sliders and number inputs - bidirectional sync
        this.eqFrequencies.forEach(band => {
            const slider = document.getElementById(`eq-${band.name}`);
            const numberInput = document.getElementById(`val-${band.name}`);
            
            if (slider && numberInput) {
                // Slider changes number input
                slider.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    numberInput.value = value;
                    this.updateEQBand(band.name, value);
                });
                
                // Number input changes slider
                numberInput.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    // Clamp value to slider range
                    const clampedValue = Math.max(-30, Math.min(30, value));
                    slider.value = clampedValue;
                    numberInput.value = clampedValue; // Update display if clamped
                    this.updateEQBand(band.name, clampedValue);
                });
            }
        });
        
        // Effects sliders and number inputs - bidirectional sync
        const effects = ['reverb', 'spatial', 'warmth', 'saturation', 'dynamics', 'modulation'];
        effects.forEach(effect => {
            const slider = document.getElementById(effect);
            const numberInput = document.getElementById(`val-${effect}`);
            
            if (slider && numberInput) {
                // Slider changes number input
                slider.addEventListener('input', (e) => {
                    const value = parseInt(e.target.value);
                    numberInput.value = value;
                    this.updateEffect(effect, value);
                });
                
                // Number input changes slider
                numberInput.addEventListener('input', (e) => {
                    const value = parseInt(e.target.value);
                    // Clamp value to slider range
                    const clampedValue = Math.max(0, Math.min(100, value));
                    slider.value = clampedValue;
                    numberInput.value = clampedValue; // Update display if clamped
                    this.updateEffect(effect, clampedValue);
                });
            }
        });
        
        // Master volume removed - using 100% by default
    }

    async initAudioContext() {
        if (this.audioContext) return;
        
        try {
            // iOS-compatible AudioContext initialization
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 44100,
                latencyHint: 'playback'
            });

            console.log('Initial AudioContext state:', this.audioContext.state);
            
            // iOS requires explicit user interaction to unlock audio
            if (this.audioContext.state === 'suspended') {
                console.log('AudioContext suspended, attempting to resume...');
                await this.audioContext.resume();
                console.log('AudioContext resumed, new state:', this.audioContext.state);
            }
            
            // Additional iOS audio unlock - play a silent buffer
            await this.unlockIOSAudio();

            // Create audio graph
            await this.createAudioGraph();
            
            console.log('Audio context fully initialized');
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
            throw error;
        }
    }
    
    async unlockIOSAudio() {
        // Create and play a silent buffer to unlock iOS audio
        if (!this.isIOS() || this.iOSUnlocked) {
            return;
        }
        
        try {
            console.log('Attempting iOS audio unlock...');
            const buffer = this.audioContext.createBuffer(1, 1, 22050);
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            source.start(0);
            
            // Wait for the buffer to play
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Verify audio context is running
            if (this.audioContext.state === 'running') {
                this.iOSUnlocked = true;
                this.hideMobileNotice(); // Hide notice once audio is working
                console.log('iOS audio successfully unlocked');
            } else {
                console.log('iOS audio unlock incomplete, state:', this.audioContext.state);
            }
        } catch (error) {
            console.log('iOS audio unlock failed:', error);
        }
    }

    async createAudioGraph() {
        // Master gain (100% by default)
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 1.0;
        
        // Analyser for spectrum display
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.8;
        this.spectrumData = new Uint8Array(this.analyser.frequencyBinCount);
        
        // Create 10-band EQ
        this.createEqualizer();
        
        // Create effects
        await this.createEffects();
        
        // Script processor for noise generation - iOS-compatible setup
        const bufferSize = this.isMobile() ? 8192 : 4096; // Larger buffer for mobile stability
        this.scriptNode = this.audioContext.createScriptProcessor(bufferSize, 0, 2);
        this.scriptNode.onaudioprocess = (event) => this.generateAudio(event);
        
        // Ensure ScriptProcessorNode doesn't get garbage collected on iOS
        window._scriptNodeRef = this.scriptNode;
        
        // Connect complete audio graph including script processor
        this.connectAudioGraph();
    }

    createEqualizer() {
        this.eqBands = [];
        
        this.eqFrequencies.forEach(bandConfig => {
            const filter = this.audioContext.createBiquadFilter();
            filter.type = bandConfig.type;
            filter.frequency.value = bandConfig.freq;
            filter.Q.value = bandConfig.type === 'peaking' ? 1.0 : 0.7;
            filter.gain.value = 0;
            
            this.eqBands.push(filter);
        });
        
        // Chain EQ bands together
        for (let i = 0; i < this.eqBands.length - 1; i++) {
            this.eqBands[i].connect(this.eqBands[i + 1]);
        }
    }

    async createEffects() {
        // Reverb
        this.reverbNode = this.audioContext.createConvolver();
        this.reverbGain = this.audioContext.createGain();
        this.dryGain = this.audioContext.createGain();
        
        // Create reverb impulse response
        const reverbBuffer = this.createReverbImpulse(3.0, 0.7);
        this.reverbNode.buffer = reverbBuffer;
        
        // Spatial panner - iOS-compatible setup
        if (this.audioContext.createStereoPanner && !this.isIOS()) {
            this.spatialPanner = this.audioContext.createStereoPanner();
            this.spatialPanner.pan.value = 0;
            console.log('Using StereoPanner for spatial effects');
        } else {
            // iOS fallback: use simple gain node to avoid routing issues
            this.spatialPanner = this.audioContext.createGain();
            this.spatialPanner.gain.value = 1.0;
            console.log('Using Gain node for iOS spatial fallback');
        }
        
        // Warmth filter
        this.warmthFilter = this.audioContext.createBiquadFilter();
        this.warmthFilter.type = 'lowpass';
        this.warmthFilter.frequency.value = 8000;
        this.warmthFilter.Q.value = 0.7;
        
        // Saturation (using waveshaper)
        this.saturationGain = this.audioContext.createGain();
        this.saturationNode = this.audioContext.createWaveShaper();
        this.saturationNode.curve = this.createSaturationCurve();
        this.saturationNode.oversample = '2x';
        
        // Compressor
        this.compressor = this.audioContext.createDynamicsCompressor();
        this.compressor.threshold.value = -24;
        this.compressor.knee.value = 30;
        this.compressor.ratio.value = 3;
        this.compressor.attack.value = 0.1;
        this.compressor.release.value = 0.25;
        
        // Modulation (low-frequency oscillator)
        this.modulationLFO = this.audioContext.createOscillator();
        this.modulationGain = this.audioContext.createGain();
        this.modulationLFO.frequency.value = 0.5;
        this.modulationLFO.type = 'sine';
        this.modulationGain.gain.value = 0;
        
        this.modulationLFO.connect(this.modulationGain);
        this.modulationGain.connect(this.masterGain.gain);
        this.modulationLFO.start();
    }

    connectAudioGraph() {
        // Connect script processor to EQ chain (always connected, but will generate silence when stopped)
        this.scriptNode.connect(this.eqBands[0]);
        
        // EQ → Reverb split
        const lastEQBand = this.eqBands[this.eqBands.length - 1];
        lastEQBand.connect(this.dryGain);
        lastEQBand.connect(this.reverbNode);
        
        // Reverb path
        this.reverbNode.connect(this.reverbGain);
        
        // Mix dry and wet
        this.dryGain.connect(this.warmthFilter);
        this.reverbGain.connect(this.warmthFilter);
        
        // Effects chain
        this.warmthFilter.connect(this.saturationGain);
        this.saturationGain.connect(this.saturationNode);
        this.saturationNode.connect(this.spatialPanner);
        this.spatialPanner.connect(this.compressor);
        
        // Add soft limiter before output
        this.limiter = this.audioContext.createWaveShaper();
        this.limiter.curve = this.createSoftLimiterCurve();
        this.limiter.oversample = '2x';
        
        // Output with limiter - iOS-specific routing
        this.compressor.connect(this.masterGain);
        this.masterGain.connect(this.limiter);
        this.limiter.connect(this.analyser);
        
        // iOS-specific audio routing fix
        if (this.isIOS()) {
            // Create direct bypass for iOS
            this.iosOutputGain = this.audioContext.createGain();
            this.iosOutputGain.gain.value = 1.0;
            
            // Connect both analyzer and direct output
            this.analyser.connect(this.iosOutputGain);
            this.iosOutputGain.connect(this.audioContext.destination);
            
            console.log('iOS-specific audio routing enabled');
        } else {
            // Standard connection for other platforms
            this.analyser.connect(this.audioContext.destination);
        }
        
        // Set initial reverb mix
        this.dryGain.gain.value = 0.8;
        this.reverbGain.gain.value = 0.2;
        
        // Verify audio routing
        this.verifyAudioRouting();
        
        console.log('Audio graph connected with script processor');
    }
    
    verifyAudioRouting() {
        // Log audio graph state for debugging
        console.log('=== Audio Graph Verification ===');
        console.log('AudioContext state:', this.audioContext.state);
        console.log('AudioContext sampleRate:', this.audioContext.sampleRate);
        console.log('Master gain value:', this.masterGain?.gain?.value);
        console.log('Script node connected:', !!this.scriptNode);
        console.log('Destination connected:', this.audioContext.destination);
        
        if (this.isIOS()) {
            console.log('iOS output gain value:', this.iosOutputGain?.gain?.value);
            console.log('iOS routing enabled: true');
        }
        
        console.log('=== End Verification ===');
    }
    
    ensureIOSAudioRouting() {
        console.log('=== iOS Audio Routing Fix ===');
        
        // Boost master gain for iOS
        if (this.masterGain) {
            const currentGain = this.masterGain.gain.value;
            const boostedGain = Math.max(currentGain, 0.8); // Ensure minimum volume
            this.masterGain.gain.value = boostedGain;
            console.log('iOS master gain set to:', boostedGain);
        }
        
        // Boost iOS output gain if it exists
        if (this.iosOutputGain) {
            this.iosOutputGain.gain.value = 1.2; // Slight boost for iOS
            console.log('iOS output gain boosted to: 1.2');
        }
        
        // Force a test tone to ensure routing works
        this.testIOSAudioRouting();
        
        console.log('=== iOS Routing Fix Complete ===');
    }
    
    testIOSAudioRouting() {
        try {
            // Create a brief test tone to verify audio routing
            const testOsc = this.audioContext.createOscillator();
            const testGain = this.audioContext.createGain();
            
            testOsc.frequency.setValueAtTime(440, this.audioContext.currentTime);
            testGain.gain.setValueAtTime(0, this.audioContext.currentTime);
            testGain.gain.setValueAtTime(0.1, this.audioContext.currentTime + 0.01);
            testGain.gain.setValueAtTime(0, this.audioContext.currentTime + 0.1);
            
            testOsc.connect(testGain);
            testGain.connect(this.audioContext.destination);
            
            testOsc.start(this.audioContext.currentTime);
            testOsc.stop(this.audioContext.currentTime + 0.1);
            
            console.log('iOS test tone triggered for routing verification');
        } catch (error) {
            console.log('iOS test tone failed:', error);
        }
    }

    generateAudio(event) {
        const outputL = event.outputBuffer.getChannelData(0);
        const outputR = event.outputBuffer.getChannelData(1);
        const bufferLength = event.outputBuffer.length;
        
        // Only generate audio when playing
        if (!this.isPlaying) {
            // Fill with silence
            outputL.fill(0);
            outputR.fill(0);
            return;
        }
        
        for (let i = 0; i < bufferLength; i++) {
            let sample = 0;
            
            switch (this.currentNoiseType) {
                case 'white':
                    sample = this.generateWhiteNoise();
                    break;
                case 'pink':
                    sample = this.generatePinkNoise();
                    break;
                case 'brown':
                    sample = this.generateBrownNoise();
                    break;
                case 'blue':
                    sample = this.generateBlueNoise();
                    break;
                case 'violet':
                    sample = this.generateVioletNoise();
                    break;
                case 'gray':
                    sample = this.generateGrayNoise();
                    break;
                case 'red':
                    sample = this.generateRedNoise();
                    break;
                case 'green':
                    sample = this.generateGreenNoise();
                    break;
                default:
                    sample = this.generateWhiteNoise();
            }
            
            outputL[i] = sample;
            outputR[i] = sample * 0.95 + (Math.random() * 0.1 - 0.05); // Slight stereo variation
        }
    }

    // Noise generation methods
    generateWhiteNoise() {
        // Proper white noise generation
        return (Math.random() * 2 - 1) * 0.3; // Reduced amplitude to prevent clipping
    }

    generatePinkNoise() {
        const state = this.noiseStates.pink;
        const updateRates = [1, 2, 4, 8, 16, 32, 64];
        let sum = 0;
        
        updateRates.forEach((rate, index) => {
            if (state.counters[index] % rate === 0) {
                state.generators[index] = Math.random() * 2 - 1;
            }
            sum += state.generators[index];
            state.counters[index]++;
        });
        
        return sum * 0.05; // Reduced for smoother sound
    }

    generateBrownNoise() {
        const state = this.noiseStates.brown;
        const scaling = 0.02;
        const leakage = 0.999;
        
        const randomStep = (Math.random() * 2 - 1) * scaling;
        state.state = state.state * leakage + randomStep;
        
        // Gentle limiting
        if (Math.abs(state.state) > 0.95) {
            const sign = Math.sign(state.state);
            const excess = Math.abs(state.state) - 0.95;
            state.state = sign * (0.95 + excess * 0.1);
        }
        
        return state.state * 0.4; // Reduced for smoother sound
    }

    generateBlueNoise() {
        const whiteNoise = this.generateWhiteNoise();
        // Simple high-pass characteristics
        return whiteNoise * (1 + Math.random() * 0.5) * 0.6;
    }

    generateVioletNoise() {
        const state = this.noiseStates.violet;
        const input = this.generateWhiteNoise();
        
        // Second-order high-pass characteristics
        const output = input - state.prev;
        state.prev = input;
        
        return output * 0.5;
    }

    generateGrayNoise() {
        const state = this.noiseStates.gray;
        const input = this.generateWhiteNoise();
        
        // A-weighting approximation
        let output = input;
        for (let i = 0; i < state.state.length - 1; i++) {
            const filtered = 0.7 * output + 0.3 * state.state[i];
            state.state[i + 1] = state.state[i];
            state.state[i] = filtered;
            output = filtered;
        }
        
        return output * 0.6;
    }

    generateRedNoise() {
        const state = this.noiseStates.red;
        const scaling = 0.01;
        const leakage = 0.9995;
        
        // Even stronger low-pass than brown noise
        const randomStep = (Math.random() * 2 - 1) * scaling;
        state.state = state.state * leakage + randomStep;
        
        return state.state * 0.8;
    }

    generateGreenNoise() {
        const state = this.noiseStates.green;
        const input = this.generateWhiteNoise();
        
        // Multi-stage filtering for mid-frequency emphasis
        let sample = input;
        
        // Simulate band-pass characteristics
        for (let i = 0; i < state.filterState.length - 1; i += 2) {
            const hp = sample - state.filterState[i] * 0.95;
            const lp = hp * 0.1 + state.filterState[i + 1] * 0.9;
            state.filterState[i] = sample;
            state.filterState[i + 1] = lp;
            sample = lp;
        }
        
        return sample * 1.2;
    }

    // Control methods
    updateEQBand(bandName, gainDb) {
        const bandIndex = this.eqFrequencies.findIndex(band => band.name === bandName);
        if (bandIndex !== -1 && this.eqBands[bandIndex]) {
            this.eqBands[bandIndex].gain.value = gainDb;
            
            // Auto-compensate master gain when boosting heavily
            this.updateAutoGainCompensation();
        }
    }

    updateAutoGainCompensation() {
        // Calculate total boost across all EQ bands
        let totalBoost = 0;
        this.eqBands.forEach(band => {
            const gain = band.gain.value;
            if (gain > 0) {
                totalBoost += gain;
            }
        });
        
        // Reduce master gain if total boost is excessive
        let compensationFactor = 1.0;
        if (totalBoost > 20) {
            compensationFactor = 20 / totalBoost; // Limit total boost effect
        }
        
        // Apply compensation to prevent clipping (using 100% as base)
        const baseVolume = 1.0; // Always 100%
        const compensatedVolume = baseVolume * compensationFactor;
        
        if (this.masterGain) {
            this.masterGain.gain.value = compensatedVolume; // Linear scaling for 100% volume
        }
    }

    updateEffect(effectName, value) {
        const normalizedValue = value / 100;
        
        switch (effectName) {
            case 'reverb':
                if (this.reverbGain && this.dryGain) {
                    this.reverbGain.gain.value = normalizedValue * 0.8;
                    this.dryGain.gain.value = 1 - normalizedValue * 0.5;
                }
                break;
                
            case 'spatial':
                if (this.spatialPanner) {
                    const pan = (normalizedValue - 0.5) * 0.6;
                    if (this.spatialPanner.pan) {
                        this.spatialPanner.pan.value = pan;
                    }
                }
                break;
                
            case 'warmth':
                if (this.warmthFilter) {
                    const freq = 20000 - (normalizedValue * 15000);
                    this.warmthFilter.frequency.value = Math.max(1000, freq);
                }
                break;
                
            case 'saturation':
                if (this.saturationGain) {
                    // Limit saturation gain to prevent harsh distortion
                    this.saturationGain.gain.value = 1 + normalizedValue * 1.5; // Reduced from 2 to 1.5
                    this.saturationNode.curve = this.createSaturationCurve(normalizedValue * 0.8); // Softer curve
                }
                break;
                
            case 'dynamics':
                if (this.compressor) {
                    this.compressor.ratio.value = 1 + normalizedValue * 8;
                    this.compressor.threshold.value = -40 + normalizedValue * 35;
                }
                break;
                
            case 'modulation':
                if (this.modulationGain) {
                    this.modulationGain.gain.value = normalizedValue * 0.3;
                }
                break;
        }
    }

    // updateVolume method removed - using fixed 100% volume

    // Playback control
    async togglePlayback() {
        console.log('=== togglePlayback started ===');
        console.log('isPlaying:', this.isPlaying);
        console.log('audioContext exists:', !!this.audioContext);
        
        try {
            if (!this.audioContext) {
                console.log('Initializing audio context...');
                await this.initAudioContext();
                console.log('Audio context initialized');
            }
            
            if (this.isPlaying) {
                console.log('Stopping playback...');
                this.stop();
            } else {
                console.log('Starting playback...');
                await this.play();
            }
            console.log('=== togglePlayback completed ===');
        } catch (error) {
            console.error('Playback error:', error);
            alert('Audio playback failed. Please try again.');
        }
    }

    async play() {
        if (!this.isPlaying) {
            // Ensure audio context is running - critical for iOS
            if (this.audioContext.state === 'suspended') {
                console.log('Resuming suspended AudioContext...');
                await this.audioContext.resume();
                console.log('AudioContext resumed, state:', this.audioContext.state);
            }
            
            // iOS-specific unlock if needed
            if (this.isIOS() && !this.iOSUnlocked) {
                await this.unlockIOSAudio();
            }
            
            // Final state check
            if (this.audioContext.state !== 'running') {
                console.error('AudioContext not running after unlock attempts, state:', this.audioContext.state);
                throw new Error(`AudioContext failed to start (state: ${this.audioContext.state})`);
            }
            
            // iOS-specific volume boost and routing verification
            if (this.isIOS()) {
                this.ensureIOSAudioRouting();
            }
            
            this.isPlaying = true;
            
            // Script processor is always connected, just change state
            
            // Update UI
            const centerButton = document.getElementById('playButton');
            centerButton.classList.remove('stopped');
            centerButton.classList.add('playing');
            centerButton.innerHTML = '⏹ STOP';
            
            // Start spectrum animation
            this.startSpectrumAnimation();
            
            console.log(`Playing ${this.currentNoiseType} noise`);
            console.log('Master gain value:', this.masterGain ? this.masterGain.gain.value : 'not set');
            console.log('Audio context state:', this.audioContext.state);
            console.log('Script node connected:', this.scriptNode.connected);
        }
    }

    stop() {
        if (this.isPlaying) {
            this.isPlaying = false;
            
            // Script processor stays connected, just change state to generate silence
            
            // Update UI
            const centerButton = document.getElementById('playButton');
            centerButton.classList.remove('playing');
            centerButton.classList.add('stopped');
            centerButton.innerHTML = '▶ PLAY';
            
            console.log('Stopped playback');
        }
    }

    // Utility methods
    createReverbImpulse(duration, decay) {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const t = i / sampleRate;
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - t / duration, decay);
            }
        }
        
        return impulse;
    }

    createSaturationCurve(amount = 0.5) {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + amount * 20) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
        }
        
        return curve;
    }

    createSoftLimiterCurve() {
        const samples = 44100;
        const curve = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1; // -1 to 1
            
            // Soft limiting using hyperbolic tangent
            curve[i] = Math.tanh(x * 0.7) * 0.95; // Gentle limiting at 95% of full scale
        }
        
        return curve;
    }

    // Spectrum display
    initSpectrumDisplay() {
        this.spectrumCanvas = document.getElementById('spectrumCanvas');
        this.spectrumCtx = this.spectrumCanvas.getContext('2d');
    }

    startSpectrumAnimation() {
        const animate = () => {
            if (this.isPlaying && this.analyser) {
                this.analyser.getByteFrequencyData(this.spectrumData);
                this.drawSpectrum();
            }
            requestAnimationFrame(animate);
        };
        animate();
    }

    drawSpectrum() {
        const canvas = this.spectrumCanvas;
        const ctx = this.spectrumCtx;
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
        
        const barWidth = width / this.spectrumData.length * 2;
        let x = 0;
        
        for (let i = 0; i < this.spectrumData.length; i++) {
            const barHeight = (this.spectrumData[i] / 255) * height * 0.8;
            
            const hue = (i / this.spectrumData.length) * 360;
            ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
            ctx.fillRect(x, height - barHeight, barWidth, barHeight);
            
            x += barWidth;
        }
    }

    // Profile management
    exportProfile() {
        // Ask user for filename
        const fileName = prompt('Enter a name for your sound profile:', `${this.currentNoiseType}_noise_profile`);
        if (!fileName) {
            return; // User cancelled
        }
        
        // Clean filename (remove invalid characters)
        const cleanFileName = fileName.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
        
        const profile = {
            name: fileName,
            noiseType: this.currentNoiseType,
            eq: {},
            effects: {},
            volume: 100, // Always 100%
            version: '1.0',
            created: new Date().toISOString()
        };
        
        // Export EQ settings
        this.eqFrequencies.forEach(band => {
            const slider = document.getElementById(`eq-${band.name}`);
            profile.eq[band.name] = parseFloat(slider.value);
        });
        
        // Export effect settings
        const effects = ['reverb', 'spatial', 'warmth', 'saturation', 'dynamics', 'modulation'];
        effects.forEach(effect => {
            const slider = document.getElementById(effect);
            profile.effects[effect] = parseInt(slider.value);
        });
        
        // Download as JSON
        const dataStr = JSON.stringify(profile, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${cleanFileName}.json`;
        link.click();
        
        console.log('Profile exported:', profile);
        alert(`Profile "${fileName}" exported successfully!`);
    }

    importProfile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const profile = JSON.parse(e.target.result);
                this.loadProfile(profile);
            } catch (error) {
                console.error('Error importing profile:', error);
                alert('Error importing profile. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }

    loadProfile(profile) {
        // Load noise type
        if (profile.noiseType) {
            this.selectNoiseType(profile.noiseType);
        }
        
        // Load EQ settings
        if (profile.eq) {
            Object.keys(profile.eq).forEach(bandName => {
                const slider = document.getElementById(`eq-${bandName}`);
                const numberInput = document.getElementById(`val-${bandName}`);
                if (slider && numberInput) {
                    slider.value = profile.eq[bandName];
                    numberInput.value = profile.eq[bandName];
                    this.updateEQBand(bandName, profile.eq[bandName]);
                }
            });
        }
        
        // Load effect settings
        if (profile.effects) {
            Object.keys(profile.effects).forEach(effectName => {
                const slider = document.getElementById(effectName);
                const numberInput = document.getElementById(`val-${effectName}`);
                if (slider && numberInput) {
                    slider.value = profile.effects[effectName];
                    numberInput.value = profile.effects[effectName];
                    this.updateEffect(effectName, profile.effects[effectName]);
                }
            });
        }
        
        // Volume is always 100% - no need to load
        
        console.log('Profile loaded:', profile.name);
        alert(`Profile loaded: ${profile.name}`);
    }

    selectNoiseType(type) {
        this.currentNoiseType = type;
        
        // Update UI
        document.querySelectorAll('.noise-type').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeButton = document.querySelector(`[data-type="${type}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        console.log(`Selected noise type: ${type}`);
    }
}

// Global functions for UI interaction
let soundEngine;

window.addEventListener('DOMContentLoaded', () => {
    soundEngine = new SoundDesignerEngine();
    console.log('Sound engine initialized');
});

function handlePlayButtonClick() {
    console.log('=== handlePlayButtonClick called ===');
    console.log('soundEngine exists:', !!soundEngine);
    
    if (soundEngine) {
        console.log('Calling soundEngine.togglePlayback()...');
        try {
            soundEngine.togglePlayback();
            console.log('togglePlayback() completed');
        } catch (error) {
            console.error('Error in togglePlayback:', error);
        }
    } else {
        console.error('Sound engine not initialized yet');
    }
    console.log('=== handlePlayButtonClick finished ===');
}

function selectNoiseType(element, type) {
    if (soundEngine) {
        soundEngine.selectNoiseType(type);
    }
}

function exportProfile() {
    soundEngine.exportProfile();
}

function importProfile(event) {
    soundEngine.importProfile(event);
}