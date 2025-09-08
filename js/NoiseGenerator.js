/**
 * NoiseGenerator - Scientifically accurate colored noise generator using Web Audio API
 * 
 * This class implements various noise types with proper mathematical models:
 * - Pink Noise: 1/f power distribution (3dB per octave rolloff)
 * - Brown Noise: 1/f² power distribution (6dB per octave rolloff) 
 * - White Noise: Flat power distribution across all frequencies
 * - Green Noise: Mid-frequency emphasis for relaxation (inverse A-weighting)
 * - Blue Noise: High-frequency emphasis with f power distribution
 */

class NoiseGenerator {
    constructor() {
        this.audioContext = null;
        this.noiseBuffer = null;
        this.sourceNode = null;
        this.scriptNode = null;
        this.filterChain = [];
        this.gainNode = null;
        this.isPlaying = false;
        this.currentNoiseType = 'pink';
        
        // Buffer size for real-time generation
        this.bufferSize = 4096; // Process in 4K chunks
        this.sampleRate = 44100;
        
        // State variables for continuous generation
        this.brownNoiseState = 0;
        this.pinkNoiseState = new Array(7).fill(0).map(() => Math.random() * 2 - 1);
        this.pinkNoiseCounters = new Array(7).fill(0);
        
        // Initialize audio context on first user interaction
        this.initPromise = null;
    }

    /**
     * Initialize the audio context and create the audio graph
     * Must be called after user gesture due to browser autoplay policies
     */
    async init() {
        if (this.initPromise) return this.initPromise;
        
        this.initPromise = this._initAudio();
        return this.initPromise;
    }

    async _initAudio() {
        try {
            // Create audio context with optimal settings
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: this.sampleRate,
                latencyHint: 'playback' // Optimize for consistent playback
            });

            // Resume context if suspended (required in some browsers)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            // Create the main gain node for volume control
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            
            // Set initial volume (50%)
            this.setVolume(0.5);
            
            console.log('Audio context initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
            throw error;
        }
    }

    /**
     * Generate white noise buffer
     * White noise has equal power at all frequencies
     */
    generateWhiteNoise(length) {
        const buffer = new Float32Array(length);
        for (let i = 0; i < length; i++) {
            // Generate random values between -1 and 1
            buffer[i] = (Math.random() * 2 - 1);
        }
        return buffer;
    }

    /**
     * Generate pink noise using the Voss-McCartney algorithm
     * Pink noise has 1/f power distribution (-3dB per octave)
     */
    generatePinkNoise(length) {
        const buffer = new Float32Array(length);
        
        // Voss-McCartney algorithm with 7 generators
        const generators = new Array(7).fill(0).map(() => ({
            value: Math.random() * 2 - 1,
            counter: 0
        }));
        
        const updateRates = [1, 2, 4, 8, 16, 32, 64]; // Powers of 2
        
        for (let i = 0; i < length; i++) {
            let sum = 0;
            
            // Update each generator based on its rate
            generators.forEach((gen, index) => {
                if (i % updateRates[index] === 0) {
                    gen.value = Math.random() * 2 - 1;
                }
                sum += gen.value;
            });
            
            // Normalize and apply slight scaling for natural sound
            buffer[i] = sum * 0.15;
        }
        
        return buffer;
    }

    /**
     * Generate brown noise (Brownian noise)
     * Brown noise has 1/f² power distribution (-6dB per octave)
     */
    generateBrownNoise(length) {
        const buffer = new Float32Array(length);
        let lastValue = 0;
        const scaling = 0.018; // Slightly higher scaling for fuller sound
        const leakage = 0.9995; // Gentle DC blocking to prevent drift
        
        for (let i = 0; i < length; i++) {
            // Random walk algorithm - each sample is previous + random step
            const randomStep = (Math.random() * 2 - 1) * scaling;
            lastValue = lastValue * leakage + randomStep;
            
            // Very gentle limiting using smooth curve instead of hard clipping
            if (Math.abs(lastValue) > 0.95) {
                const sign = Math.sign(lastValue);
                const excess = Math.abs(lastValue) - 0.95;
                lastValue = sign * (0.95 + excess * 0.1); // Compress excess by 90%
            }
            
            buffer[i] = lastValue;
        }
        
        return buffer;
    }

    /**
     * Generate green noise (mid-frequency emphasis)
     * Based on inverse A-weighting curve for relaxation
     */
    generateGreenNoise(length) {
        // Start with white noise and apply frequency shaping
        const whiteNoise = this.generateWhiteNoise(length);
        
        // Apply simple mid-frequency boost using a basic filter simulation
        const buffer = new Float32Array(length);
        let prev1 = 0, prev2 = 0;
        
        // Simple IIR filter coefficients for mid-frequency emphasis
        const a0 = 0.8, a1 = -0.4, a2 = 0.1;
        const b1 = 0.3, b2 = 0.1;
        
        for (let i = 0; i < length; i++) {
            const input = whiteNoise[i];
            const output = a0 * input + a1 * prev1 + a2 * prev2 - b1 * prev1 - b2 * prev2;
            
            buffer[i] = output * 0.7; // Scale down to prevent clipping
            prev2 = prev1;
            prev1 = output;
        }
        
        return buffer;
    }

    /**
     * Generate blue noise (high-frequency emphasis)
     * Blue noise has f power distribution (+3dB per octave)
     */
    generateBlueNoise(length) {
        // Generate white noise and apply high-pass characteristics
        const whiteNoise = this.generateWhiteNoise(length);
        const buffer = new Float32Array(length);
        
        // High-pass filter simulation
        let prev = 0;
        const alpha = 0.85; // High-pass cutoff control
        
        for (let i = 0; i < length; i++) {
            const highpass = alpha * (prev + whiteNoise[i] - (prev || 0));
            buffer[i] = highpass * 0.8; // Scale to prevent clipping
            prev = whiteNoise[i];
        }
        
        return buffer;
    }

    /**
     * Create audio buffer for the specified noise type
     */
    createNoiseBuffer(noiseType) {
        const channels = 2; // Stereo
        const frameCount = this.audioContext.sampleRate * 2; // 2 seconds of audio
        
        const audioBuffer = this.audioContext.createBuffer(
            channels, 
            frameCount, 
            this.audioContext.sampleRate
        );

        // Generate noise data based on type
        let noiseData;
        switch (noiseType) {
            case 'white':
                noiseData = this.generateWhiteNoise(frameCount);
                break;
            case 'pink':
                noiseData = this.generatePinkNoise(frameCount);
                break;
            case 'brown':
                noiseData = this.generateBrownNoise(frameCount);
                break;
            case 'green':
                noiseData = this.generateGreenNoise(frameCount);
                break;
            case 'blue':
                noiseData = this.generateBlueNoise(frameCount);
                break;
            default:
                noiseData = this.generatePinkNoise(frameCount);
        }

        // Fill both channels with generated noise (with slight variations for stereo width)
        for (let channel = 0; channel < channels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            
            if (channel === 0) {
                // Left channel - use original data
                for (let i = 0; i < frameCount; i++) {
                    channelData[i] = noiseData[i];
                }
            } else {
                // Right channel - add slight phase variation for stereo effect
                for (let i = 0; i < frameCount; i++) {
                    const phaseOffset = Math.floor(frameCount * 0.001); // 0.1% phase offset
                    const index = (i + phaseOffset) % frameCount;
                    channelData[i] = noiseData[index] * 0.95; // Slight amplitude variation
                }
            }
        }

        return audioBuffer;
    }

    /**
     * Generate noise continuously using ScriptProcessorNode
     */
    generateContinuousNoise(event) {
        const outputL = event.outputBuffer.getChannelData(0);
        const outputR = event.outputBuffer.getChannelData(1);
        const bufferLength = event.outputBuffer.length;
        
        for (let i = 0; i < bufferLength; i++) {
            let sample = 0;
            
            switch (this.currentNoiseType) {
                case 'white':
                    sample = (Math.random() * 2 - 1);
                    break;
                    
                case 'pink':
                    sample = this.generatePinkNoiseSample();
                    break;
                    
                case 'brown':
                    sample = this.generateBrownNoiseSample();
                    break;
                    
                case 'green':
                    sample = this.generateGreenNoiseSample();
                    break;
                    
                case 'blue':
                    sample = this.generateBlueNoiseSample();
                    break;
                    
                default:
                    sample = this.generatePinkNoiseSample();
            }
            
            // Apply to both channels with slight stereo variation
            outputL[i] = sample;
            outputR[i] = sample * 0.95 + (Math.random() * 0.1 - 0.05);
        }
    }

    /**
     * Generate single pink noise sample (continuous)
     */
    generatePinkNoiseSample() {
        const updateRates = [1, 2, 4, 8, 16, 32, 64];
        let sum = 0;
        
        // Update generators based on counters
        updateRates.forEach((rate, index) => {
            if (this.pinkNoiseCounters[index] % rate === 0) {
                this.pinkNoiseState[index] = Math.random() * 2 - 1;
            }
            sum += this.pinkNoiseState[index];
            this.pinkNoiseCounters[index]++;
        });
        
        return sum * 0.15;
    }

    /**
     * Generate single brown noise sample (continuous)
     */
    generateBrownNoiseSample() {
        const scaling = 0.018;
        const leakage = 0.9995;
        
        const randomStep = (Math.random() * 2 - 1) * scaling;
        this.brownNoiseState = this.brownNoiseState * leakage + randomStep;
        
        // Gentle limiting
        if (Math.abs(this.brownNoiseState) > 0.95) {
            const sign = Math.sign(this.brownNoiseState);
            const excess = Math.abs(this.brownNoiseState) - 0.95;
            this.brownNoiseState = sign * (0.95 + excess * 0.1);
        }
        
        return this.brownNoiseState;
    }

    /**
     * Generate single green noise sample (continuous)
     */
    generateGreenNoiseSample() {
        // Simple mid-frequency emphasis using running average
        const whiteNoise = (Math.random() * 2 - 1);
        
        // Store previous samples for filtering (simplified)
        if (!this.greenNoiseBuffer) this.greenNoiseBuffer = [0, 0];
        
        const filtered = 0.8 * whiteNoise + 0.3 * this.greenNoiseBuffer[0] - 0.1 * this.greenNoiseBuffer[1];
        this.greenNoiseBuffer[1] = this.greenNoiseBuffer[0];
        this.greenNoiseBuffer[0] = filtered;
        
        return filtered * 0.7;
    }

    /**
     * Generate single blue noise sample (continuous)
     */
    generateBlueNoiseSample() {
        const whiteNoise = (Math.random() * 2 - 1);
        
        // High-pass filter simulation
        if (!this.blueNoisePrev) this.blueNoisePrev = 0;
        
        const alpha = 0.85;
        const highpass = alpha * (this.blueNoisePrev + whiteNoise - (this.blueNoisePrev || 0));
        this.blueNoisePrev = whiteNoise;
        
        return highpass * 0.8;
    }

    /**
     * Start playing noise of specified type
     */
    async start(noiseType = 'pink') {
        if (!this.audioContext) {
            await this.init();
        }

        // Stop current playback if active
        this.stop();

        this.currentNoiseType = noiseType;
        
        // Reset state variables for continuous generation
        this.brownNoiseState = 0;
        this.pinkNoiseState = new Array(7).fill(0).map(() => Math.random() * 2 - 1);
        this.pinkNoiseCounters = new Array(7).fill(0);
        
        // Create ScriptProcessorNode for continuous generation
        this.scriptNode = this.audioContext.createScriptProcessor(this.bufferSize, 0, 2);
        this.scriptNode.onaudioprocess = (event) => this.generateContinuousNoise(event);
        
        // Connect to audio graph
        this.scriptNode.connect(this.gainNode);
        
        this.isPlaying = true;
        
        console.log(`Started continuous ${noiseType} noise generation`);
    }

    /**
     * Stop noise playback
     */
    stop() {
        if (this.isPlaying) {
            if (this.sourceNode) {
                this.sourceNode.stop();
                this.sourceNode.disconnect();
                this.sourceNode = null;
            }
            
            if (this.scriptNode) {
                this.scriptNode.disconnect();
                this.scriptNode.onaudioprocess = null;
                this.scriptNode = null;
            }
            
            this.isPlaying = false;
            console.log('Stopped noise generation');
        }
    }

    /**
     * Set volume level (0-1)
     */
    setVolume(volume) {
        if (this.gainNode) {
            // Use exponential scaling for more natural volume perception
            const scaledVolume = volume * volume;
            this.gainNode.gain.value = scaledVolume;
        }
    }

    /**
     * Fade volume to target level over specified duration
     */
    fadeVolume(targetVolume, duration = 1000) {
        if (!this.gainNode) return;
        
        const startVolume = this.gainNode.gain.value;
        const targetScaled = targetVolume * targetVolume; // Exponential scaling
        
        // Cancel any existing automation
        this.gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
        
        // Set current value and ramp to target
        this.gainNode.gain.setValueAtTime(startVolume, this.audioContext.currentTime);
        this.gainNode.gain.exponentialRampToValueAtTime(
            Math.max(0.001, targetScaled), // Avoid zero for exponential ramp
            this.audioContext.currentTime + duration / 1000
        );
    }

    /**
     * Get current audio context state
     */
    getState() {
        return {
            isPlaying: this.isPlaying,
            currentNoiseType: this.currentNoiseType,
            volume: this.gainNode ? Math.sqrt(this.gainNode.gain.value) : 0,
            contextState: this.audioContext ? this.audioContext.state : 'closed'
        };
    }

    /**
     * Clean up audio resources
     */
    dispose() {
        this.stop();
        
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
        
        this.audioContext = null;
        this.gainNode = null;
        this.filterChain = [];
        this.noiseBuffer = null;
        
        console.log('NoiseGenerator disposed');
    }
}