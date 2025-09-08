/**
 * AudioEffects - Advanced audio processing for ocean-like ambiance
 * 
 * This class provides sophisticated audio effects to transform colored noise
 * into deep, rich, ocean-like soundscapes using Web Audio API.
 * 
 * Effects included:
 * - Convolution reverb with custom impulse responses
 * - Multi-band filtering for frequency sculpting
 * - Spatial audio processing for immersive experience
 * - Dynamic compression for consistent levels
 * - Low-frequency enhancement for depth
 */

class AudioEffects {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.inputNode = null;
        this.outputNode = null;
        
        // Effect nodes
        this.reverbNode = null;
        this.reverbGain = null;
        this.dryGain = null;
        this.lowPassFilter = null;
        this.highPassFilter = null;
        this.compressor = null;
        this.spatialPanner = null;
        this.lowShelfFilter = null;
        
        // Effect parameters
        this.reverbLevel = 0.4;
        this.filterFrequency = 800;
        this.lowShelfGain = 3; // dB boost for low frequencies
        
        this.isInitialized = false;
    }

    /**
     * Initialize the effects chain
     */
    async init() {
        if (this.isInitialized) return;

        try {
            await this.createEffectsChain();
            this.isInitialized = true;
            console.log('Audio effects initialized successfully');
        } catch (error) {
            console.error('Failed to initialize audio effects:', error);
            throw error;
        }
    }

    /**
     * Create the complete effects processing chain
     */
    async createEffectsChain() {
        // Create input and output nodes
        this.inputNode = this.audioContext.createGain();
        this.outputNode = this.audioContext.createGain();

        // Create reverb effect
        await this.createReverbEffect();
        
        // Create filtering effects
        this.createFilteringEffects();
        
        // Create compression
        this.createCompression();
        
        // Create spatial effects
        this.createSpatialEffects();
        
        // Connect the effects chain
        this.connectEffectsChain();
    }

    /**
     * Create convolution reverb with synthetic impulse response
     */
    async createReverbEffect() {
        // Create convolver node
        this.reverbNode = this.audioContext.createConvolver();
        
        // Create dry/wet mix controls
        this.dryGain = this.audioContext.createGain();
        this.reverbGain = this.audioContext.createGain();
        
        // Set initial mix levels
        this.dryGain.gain.value = 1 - this.reverbLevel;
        this.reverbGain.gain.value = this.reverbLevel;
        
        // Generate synthetic impulse response for ocean-like reverb
        const impulseBuffer = this.createOceanImpulseResponse();
        this.reverbNode.buffer = impulseBuffer;
    }

    /**
     * Generate synthetic impulse response for ocean-like reverb
     */
    createOceanImpulseResponse() {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * 3; // 3 seconds of reverb
        const channels = 2; // Stereo
        
        const impulse = this.audioContext.createBuffer(channels, length, sampleRate);
        
        for (let channel = 0; channel < channels; channel++) {
            const channelData = impulse.getChannelData(channel);
            
            // Create multiple overlapping exponential decays to simulate ocean ambiance
            for (let i = 0; i < length; i++) {
                const time = i / sampleRate;
                let sample = 0;
                
                // Primary decay (room reverb)
                sample += Math.random() * 0.5 * Math.exp(-time * 2);
                
                // Secondary decay (distant reflections)
                sample += Math.random() * 0.3 * Math.exp(-time * 0.8) * Math.sin(time * 0.5);
                
                // Tertiary decay (ocean-like resonances)
                sample += Math.random() * 0.2 * Math.exp(-time * 0.3) * Math.sin(time * 0.1);
                
                // Add subtle modulation for organic feel
                const modulation = 1 + 0.1 * Math.sin(time * 0.3) * Math.exp(-time);
                sample *= modulation;
                
                // Apply stereo width variation
                if (channel === 1) {
                    sample *= 0.8 + 0.2 * Math.sin(time * 0.7);
                }
                
                channelData[i] = sample * 0.3; // Scale down overall level
            }
        }
        
        return impulse;
    }

    /**
     * Create filtering effects for frequency sculpting
     */
    createFilteringEffects() {
        // Low-pass filter for warmth
        this.lowPassFilter = this.audioContext.createBiquadFilter();
        this.lowPassFilter.type = 'lowpass';
        this.lowPassFilter.frequency.value = this.filterFrequency;
        this.lowPassFilter.Q.value = 0.8; // Gentle slope
        
        // High-pass filter to remove excessive low-end
        this.highPassFilter = this.audioContext.createBiquadFilter();
        this.highPassFilter.type = 'highpass';
        this.highPassFilter.frequency.value = 40; // Remove sub-bass
        this.highPassFilter.Q.value = 0.7;
        
        // Low shelf filter for bass enhancement
        this.lowShelfFilter = this.audioContext.createBiquadFilter();
        this.lowShelfFilter.type = 'lowshelf';
        this.lowShelfFilter.frequency.value = 200;
        this.lowShelfFilter.gain.value = this.lowShelfGain;
    }

    /**
     * Create compression for consistent dynamics
     */
    createCompression() {
        this.compressor = this.audioContext.createDynamicsCompressor();
        
        // Gentle compression settings for ambient music
        this.compressor.threshold.value = -24; // dB
        this.compressor.knee.value = 30; // Soft knee
        this.compressor.ratio.value = 3; // 3:1 ratio
        this.compressor.attack.value = 0.1; // 100ms attack
        this.compressor.release.value = 0.25; // 250ms release
    }

    /**
     * Create spatial audio effects
     */
    createSpatialEffects() {
        // Create panner for spatial positioning
        if (this.audioContext.createStereoPanner) {
            // Use StereoPannerNode for simple stereo positioning
            this.spatialPanner = this.audioContext.createStereoPanner();
            this.spatialPanner.pan.value = 0; // Center position
        } else {
            // Fallback to PannerNode for older browsers
            this.spatialPanner = this.audioContext.createPanner();
            this.spatialPanner.panningModel = 'equalpower';
            this.spatialPanner.setPosition(0, 0, -1);
        }
    }

    /**
     * Connect all effects in the processing chain
     */
    connectEffectsChain() {
        // Input splits to dry and wet paths
        this.inputNode.connect(this.dryGain);
        this.inputNode.connect(this.reverbNode);
        
        // Reverb path
        this.reverbNode.connect(this.reverbGain);
        
        // Both paths go through filtering
        this.dryGain.connect(this.highPassFilter);
        this.reverbGain.connect(this.highPassFilter);
        
        // Filter chain
        this.highPassFilter.connect(this.lowShelfFilter);
        this.lowShelfFilter.connect(this.lowPassFilter);
        
        // Compression
        this.lowPassFilter.connect(this.compressor);
        
        // Spatial processing
        this.compressor.connect(this.spatialPanner);
        
        // Final output
        this.spatialPanner.connect(this.outputNode);
        
        console.log('Effects chain connected');
    }

    /**
     * Connect input source to effects chain
     */
    connect(sourceNode) {
        if (!this.isInitialized) {
            console.error('AudioEffects not initialized');
            return;
        }
        
        sourceNode.connect(this.inputNode);
        return this.outputNode;
    }

    /**
     * Set reverb level (0-1)
     */
    setReverbLevel(level) {
        this.reverbLevel = Math.max(0, Math.min(1, level));
        
        if (this.dryGain && this.reverbGain) {
            // Crossfade between dry and wet signals
            const dryLevel = Math.sqrt(1 - this.reverbLevel);
            const wetLevel = Math.sqrt(this.reverbLevel);
            
            this.dryGain.gain.value = dryLevel;
            this.reverbGain.gain.value = wetLevel;
        }
    }

    /**
     * Set low-pass filter frequency for brightness control
     */
    setFilterFrequency(frequency) {
        this.filterFrequency = Math.max(200, Math.min(20000, frequency));
        
        if (this.lowPassFilter) {
            this.lowPassFilter.frequency.value = this.filterFrequency;
        }
    }

    /**
     * Set low-end enhancement level
     */
    setLowEndGain(gainDb) {
        this.lowShelfGain = Math.max(-12, Math.min(12, gainDb));
        
        if (this.lowShelfFilter) {
            this.lowShelfFilter.gain.value = this.lowShelfGain;
        }
    }

    /**
     * Set spatial position (-1 to 1)
     */
    setSpatialPosition(position) {
        const clampedPosition = Math.max(-1, Math.min(1, position));
        
        if (this.spatialPanner) {
            if (this.spatialPanner.pan) {
                // StereoPannerNode
                this.spatialPanner.pan.value = clampedPosition;
            } else if (this.spatialPanner.setPosition) {
                // PannerNode
                this.spatialPanner.setPosition(clampedPosition, 0, -1);
            }
        }
    }

    /**
     * Animate spatial position for subtle movement
     */
    startSpatialAnimation() {
        if (!this.spatialPanner) return;
        
        const animate = () => {
            const time = this.audioContext.currentTime;
            const position = Math.sin(time * 0.1) * 0.3; // Slow gentle movement
            this.setSpatialPosition(position);
            
            // Continue animation if effects are active
            if (this.isInitialized) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    /**
     * Get current effects settings
     */
    getSettings() {
        return {
            reverbLevel: this.reverbLevel,
            filterFrequency: this.filterFrequency,
            lowShelfGain: this.lowShelfGain,
            spatialPosition: this.spatialPanner?.pan?.value || 0
        };
    }

    /**
     * Apply preset configurations for different ambiance types
     */
    applyPreset(presetName) {
        const presets = {
            ocean: {
                reverbLevel: 0.6,
                filterFrequency: 800,
                lowShelfGain: 4
            },
            forest: {
                reverbLevel: 0.4,
                filterFrequency: 1200,
                lowShelfGain: 2
            },
            cave: {
                reverbLevel: 0.8,
                filterFrequency: 500,
                lowShelfGain: 6
            },
            space: {
                reverbLevel: 0.7,
                filterFrequency: 400,
                lowShelfGain: 1
            }
        };

        const preset = presets[presetName];
        if (preset) {
            this.setReverbLevel(preset.reverbLevel);
            this.setFilterFrequency(preset.filterFrequency);
            this.setLowEndGain(preset.lowShelfGain);
            
            console.log(`Applied ${presetName} preset`);
        }
    }

    /**
     * Clean up audio resources
     */
    dispose() {
        // Disconnect all nodes
        if (this.inputNode) this.inputNode.disconnect();
        if (this.outputNode) this.outputNode.disconnect();
        if (this.reverbNode) this.reverbNode.disconnect();
        if (this.dryGain) this.dryGain.disconnect();
        if (this.reverbGain) this.reverbGain.disconnect();
        if (this.lowPassFilter) this.lowPassFilter.disconnect();
        if (this.highPassFilter) this.highPassFilter.disconnect();
        if (this.compressor) this.compressor.disconnect();
        if (this.spatialPanner) this.spatialPanner.disconnect();
        if (this.lowShelfFilter) this.lowShelfFilter.disconnect();
        
        // Clear references
        this.inputNode = null;
        this.outputNode = null;
        this.reverbNode = null;
        this.dryGain = null;
        this.reverbGain = null;
        this.lowPassFilter = null;
        this.highPassFilter = null;
        this.compressor = null;
        this.spatialPanner = null;
        this.lowShelfFilter = null;
        
        this.isInitialized = false;
        
        console.log('AudioEffects disposed');
    }
}