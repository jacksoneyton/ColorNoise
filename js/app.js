/**
 * ColorNoise App - Main application logic
 * 
 * This file orchestrates the entire application, connecting the UI with
 * the audio generation, effects processing, and timer management systems.
 */

class ColorNoiseApp {
    constructor() {
        // Core components
        this.noiseGenerator = null;
        this.audioEffects = null;
        this.timerManager = null;
        
        // State
        this.isPlaying = false;
        this.currentNoiseType = 'pink';
        this.volume = 0.5;
        this.isFading = false;
        
        // UI elements
        this.ui = {
            playPauseBtn: null,
            playIcon: null,
            pauseIcon: null,
            playStatus: null,
            noiseButtons: null,
            volumeSlider: null,
            volumeValue: null,
            timerSelect: null,
            customTimer: null,
            timerDisplay: null,
            modeIndicator: null,
            modeText: null,
            timeText: null
        };
        
        // Initialize the application
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('Initializing ColorNoise App...');
            
            // Get UI element references
            this.getUIElements();
            
            // Initialize components
            this.noiseGenerator = new NoiseGenerator();
            this.timerManager = new TimerManager();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Setup timer callbacks
            this.setupTimerCallbacks();
            
            // Initialize UI state
            this.updateUI();
            
            console.log('ColorNoise App initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize ColorNoise App:', error);
            this.showError('Failed to initialize audio. Please refresh and try again.');
        }
    }

    /**
     * Get references to UI elements
     */
    getUIElements() {
        this.ui.playPauseBtn = document.getElementById('playPauseBtn');
        this.ui.playIcon = document.querySelector('.play-icon');
        this.ui.pauseIcon = document.querySelector('.pause-icon');
        this.ui.playStatus = document.querySelector('.play-status');
        this.ui.noiseButtons = document.querySelectorAll('.noise-btn');
        this.ui.volumeSlider = document.getElementById('volumeSlider');
        this.ui.volumeValue = document.querySelector('.volume-value');
        this.ui.timerSelect = document.getElementById('timerSelect');
        this.ui.customTimer = document.getElementById('customTimer');
        this.ui.timerDisplay = document.querySelector('.timer-display');
        this.ui.modeIndicator = document.querySelector('.mode-indicator');
        this.ui.modeText = document.querySelector('.mode-text');
        this.ui.timeText = document.querySelector('.time-text');
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Play/Pause button
        this.ui.playPauseBtn.addEventListener('click', () => {
            this.togglePlayPause();
        });

        // Noise type buttons
        this.ui.noiseButtons.forEach(button => {
            button.addEventListener('click', () => {
                const noiseType = button.dataset.type;
                this.selectNoiseType(noiseType);
            });
        });

        // Volume slider
        this.ui.volumeSlider.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value) / 100;
            this.setVolume(volume);
        });

        // Timer select
        this.ui.timerSelect.addEventListener('change', (e) => {
            this.handleTimerChange(e.target.value);
        });

        // Custom timer input
        this.ui.customTimer.addEventListener('change', (e) => {
            const minutes = parseInt(e.target.value);
            if (minutes > 0) {
                this.startTimer(minutes);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });

        // Handle visibility change (tab switching)
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Handle beforeunload for cleanup
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    /**
     * Setup timer manager callbacks
     */
    setupTimerCallbacks() {
        this.timerManager.setCallbacks({
            onTick: (remainingTime, totalTime) => {
                this.updateTimerDisplay(remainingTime);
                
                // Start fade-out in last 30 seconds
                if (remainingTime <= 30 && remainingTime > 0 && !this.isFading) {
                    this.startFadeOut(remainingTime * 1000);
                }
            },
            onComplete: () => {
                this.handleTimerComplete();
            },
            onCancel: () => {
                this.updateTimerDisplay(0);
            }
        });
    }

    /**
     * Toggle play/pause state
     */
    async togglePlayPause() {
        try {
            if (this.isPlaying) {
                await this.pause();
            } else {
                await this.play();
            }
        } catch (error) {
            console.error('Failed to toggle playback:', error);
            this.showError('Playback failed. Please try again.');
        }
    }

    /**
     * Start playback
     */
    async play() {
        if (this.isPlaying) return;

        // Initialize audio context on first play (required by browsers)
        if (!this.noiseGenerator.audioContext) {
            await this.noiseGenerator.init();
            
            // Initialize effects
            this.audioEffects = new AudioEffects(this.noiseGenerator.audioContext);
            await this.audioEffects.init();
            
            // Connect noise generator through effects
            this.audioEffects.connect(this.noiseGenerator.gainNode);
            
            // Apply ocean preset by default
            this.audioEffects.applyPreset('ocean');
            
            // Start spatial animation
            this.audioEffects.startSpatialAnimation();
        }

        // Start noise generation
        await this.noiseGenerator.start(this.currentNoiseType);
        
        // Fade in
        this.fadeIn();
        
        this.isPlaying = true;
        this.updatePlayButton();
        this.updateStatus();
        
        console.log(`Started playing ${this.currentNoiseType} noise`);
    }

    /**
     * Pause playback
     */
    async pause() {
        if (!this.isPlaying) return;

        // Fade out before stopping
        await this.fadeOut();
        
        // Stop noise generation
        this.noiseGenerator.stop();
        
        // Pause timer if active
        this.timerManager.pause();
        
        this.isPlaying = false;
        this.updatePlayButton();
        this.updateStatus();
        
        console.log('Paused playback');
    }

    /**
     * Select noise type
     */
    selectNoiseType(noiseType) {
        this.currentNoiseType = noiseType;
        
        // Update button states
        this.ui.noiseButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === noiseType);
        });
        
        // Update noise color indicator
        const colors = {
            pink: '#ff6b9d',
            brown: '#8b4513',
            white: '#ffffff',
            green: '#4caf50',
            blue: '#2196f3'
        };
        
        this.ui.modeIndicator.style.backgroundColor = colors[noiseType];
        
        // Update mode text
        const noiseNames = {
            pink: 'Pink Noise',
            brown: 'Brown Noise', 
            white: 'White Noise',
            green: 'Green Noise',
            blue: 'Blue Noise'
        };
        
        this.ui.modeText.textContent = noiseNames[noiseType];
        
        // If playing, restart with new noise type
        if (this.isPlaying) {
            this.noiseGenerator.stop();
            setTimeout(() => {
                this.noiseGenerator.start(noiseType);
            }, 100);
        }
        
        console.log(`Selected ${noiseType} noise`);
    }

    /**
     * Set volume level
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Update slider if not already at this value
        const sliderValue = Math.round(this.volume * 100);
        if (parseInt(this.ui.volumeSlider.value) !== sliderValue) {
            this.ui.volumeSlider.value = sliderValue;
        }
        
        // Update display
        this.ui.volumeValue.textContent = `${sliderValue}%`;
        
        // Apply to noise generator
        if (this.noiseGenerator) {
            this.noiseGenerator.setVolume(this.volume);
        }
    }

    /**
     * Handle timer selection change
     */
    handleTimerChange(value) {
        if (value === 'custom') {
            this.ui.customTimer.style.display = 'block';
            this.ui.customTimer.focus();
        } else {
            this.ui.customTimer.style.display = 'none';
            
            if (value === '0') {
                // Infinite timer
                this.timerManager.cancel();
                this.ui.timerDisplay.textContent = '∞';
            } else {
                const minutes = parseInt(value);
                this.startTimer(minutes);
            }
        }
    }

    /**
     * Start timer with specified minutes
     */
    startTimer(minutes) {
        if (minutes > 0 && minutes <= 480) { // Max 8 hours
            this.timerManager.start(minutes);
            
            // Resume timer if playing
            if (this.isPlaying) {
                this.timerManager.resume();
            }
            
            console.log(`Timer started: ${minutes} minutes`);
        }
    }

    /**
     * Handle timer completion
     */
    handleTimerComplete() {
        console.log('Timer completed, stopping playback');
        
        // Stop playback
        this.pause();
        
        // Reset timer UI
        this.ui.timerSelect.value = '0';
        this.ui.timerDisplay.textContent = '∞';
        
        // Show completion message briefly
        this.ui.timeText.textContent = 'Timer completed';
        setTimeout(() => {
            this.ui.timeText.textContent = 'Ready';
        }, 3000);
    }

    /**
     * Update timer display
     */
    updateTimerDisplay(remainingSeconds) {
        if (remainingSeconds > 0) {
            this.ui.timerDisplay.textContent = this.timerManager.formatTime(remainingSeconds);
            this.ui.timeText.textContent = `${this.timerManager.formatTimeWithUnits(remainingSeconds)} remaining`;
        } else {
            this.ui.timerDisplay.textContent = '∞';
            this.ui.timeText.textContent = this.isPlaying ? 'Playing' : 'Ready';
        }
    }

    /**
     * Fade in audio
     */
    fadeIn() {
        if (this.noiseGenerator) {
            this.isFading = true;
            this.noiseGenerator.fadeVolume(this.volume, 1500);
            setTimeout(() => {
                this.isFading = false;
            }, 1500);
        }
    }

    /**
     * Fade out audio
     */
    async fadeOut() {
        if (this.noiseGenerator) {
            this.isFading = true;
            this.noiseGenerator.fadeVolume(0, 1000);
            
            // Wait for fade to complete
            return new Promise(resolve => {
                setTimeout(() => {
                    this.isFading = false;
                    resolve();
                }, 1000);
            });
        }
    }

    /**
     * Start fade out over specified duration
     */
    startFadeOut(duration) {
        if (this.noiseGenerator && !this.isFading) {
            this.isFading = true;
            this.noiseGenerator.fadeVolume(0, duration);
            
            setTimeout(() => {
                this.isFading = false;
            }, duration);
        }
    }

    /**
     * Update play button state
     */
    updatePlayButton() {
        if (this.isPlaying) {
            this.ui.playIcon.style.display = 'none';
            this.ui.pauseIcon.style.display = 'block';
            this.ui.playStatus.textContent = 'Playing';
        } else {
            this.ui.playIcon.style.display = 'block';
            this.ui.pauseIcon.style.display = 'none';
            this.ui.playStatus.textContent = 'Paused';
        }
    }

    /**
     * Update status display
     */
    updateStatus() {
        if (this.isPlaying) {
            this.ui.modeIndicator.classList.add('playing');
            this.ui.timeText.textContent = this.timerManager.isActive ? 
                `${this.timerManager.formatTimeWithUnits(this.timerManager.remainingTime)} remaining` : 
                'Playing';
        } else {
            this.ui.modeIndicator.classList.remove('playing');
            this.ui.timeText.textContent = 'Ready';
        }
    }

    /**
     * Update all UI elements
     */
    updateUI() {
        this.updatePlayButton();
        this.updateStatus();
        this.setVolume(this.volume);
        this.selectNoiseType(this.currentNoiseType);
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboard(e) {
        // Only handle shortcuts when not typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

        switch (e.key) {
            case ' ':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
                e.preventDefault();
                const noiseTypes = ['pink', 'brown', 'white', 'green', 'blue'];
                const index = parseInt(e.key) - 1;
                if (index < noiseTypes.length) {
                    this.selectNoiseType(noiseTypes[index]);
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.setVolume(Math.min(1, this.volume + 0.1));
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.setVolume(Math.max(0, this.volume - 0.1));
                break;
        }
    }

    /**
     * Handle tab visibility changes
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Tab is hidden - could pause timer if desired
            console.log('Tab hidden');
        } else {
            // Tab is visible again
            console.log('Tab visible');
        }
    }

    /**
     * Show error message to user
     */
    showError(message) {
        // Simple error display - in production could use a toast/modal
        this.ui.playStatus.textContent = 'Error';
        this.ui.timeText.textContent = message;
        
        // Reset after 5 seconds
        setTimeout(() => {
            this.updateUI();
        }, 5000);
    }

    /**
     * Clean up resources
     */
    cleanup() {
        console.log('Cleaning up ColorNoise App...');
        
        if (this.timerManager) {
            this.timerManager.dispose();
        }
        
        if (this.audioEffects) {
            this.audioEffects.dispose();
        }
        
        if (this.noiseGenerator) {
            this.noiseGenerator.dispose();
        }
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing ColorNoise App...');
    window.colorNoiseApp = new ColorNoiseApp();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.colorNoiseApp) {
        window.colorNoiseApp.cleanup();
    }
});