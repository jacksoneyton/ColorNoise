/**
 * TimerManager - Handles auto-off timer functionality
 * 
 * This class manages timer-based automatic shutdown of noise playback
 * with smooth fade-out transitions and user notifications.
 */

class TimerManager {
    constructor() {
        this.timerInterval = null;
        this.remainingTime = 0; // in seconds
        this.totalTime = 0; // in seconds
        this.isActive = false;
        this.callbacks = {
            onTick: null,        // Called every second with remaining time
            onComplete: null,    // Called when timer completes
            onCancel: null      // Called when timer is cancelled
        };
        
        // Timer presets in minutes
        this.presets = {
            15: 15,
            30: 30,
            60: 60,
            120: 120,
            240: 240
        };
    }

    /**
     * Set callback functions
     */
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    /**
     * Start timer with specified duration in minutes
     */
    start(minutes) {
        // Cancel any existing timer
        this.cancel();
        
        if (minutes <= 0) {
            console.log('Timer set to infinite mode');
            return;
        }
        
        this.totalTime = minutes * 60; // Convert to seconds
        this.remainingTime = this.totalTime;
        this.isActive = true;
        
        // Start countdown interval
        this.timerInterval = setInterval(() => {
            this.tick();
        }, 1000);
        
        console.log(`Timer started: ${minutes} minutes`);
        
        // Initial callback
        if (this.callbacks.onTick) {
            this.callbacks.onTick(this.remainingTime, this.totalTime);
        }
    }

    /**
     * Handle timer tick (called every second)
     */
    tick() {
        if (!this.isActive) return;
        
        this.remainingTime--;
        
        // Callback for UI updates
        if (this.callbacks.onTick) {
            this.callbacks.onTick(this.remainingTime, this.totalTime);
        }
        
        // Check if timer completed
        if (this.remainingTime <= 0) {
            this.complete();
        }
    }

    /**
     * Complete timer and trigger callback
     */
    complete() {
        console.log('Timer completed');
        
        this.isActive = false;
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        
        // Trigger completion callback
        if (this.callbacks.onComplete) {
            this.callbacks.onComplete();
        }
        
        this.reset();
    }

    /**
     * Cancel active timer
     */
    cancel() {
        if (this.isActive) {
            console.log('Timer cancelled');
            
            this.isActive = false;
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            
            // Trigger cancel callback
            if (this.callbacks.onCancel) {
                this.callbacks.onCancel();
            }
            
            this.reset();
        }
    }

    /**
     * Reset timer state
     */
    reset() {
        this.remainingTime = 0;
        this.totalTime = 0;
    }

    /**
     * Pause timer
     */
    pause() {
        if (this.isActive && this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            console.log('Timer paused');
        }
    }

    /**
     * Resume paused timer
     */
    resume() {
        if (this.isActive && !this.timerInterval && this.remainingTime > 0) {
            this.timerInterval = setInterval(() => {
                this.tick();
            }, 1000);
            console.log('Timer resumed');
        }
    }

    /**
     * Add time to current timer
     */
    addTime(minutes) {
        if (this.isActive) {
            const additionalSeconds = minutes * 60;
            this.remainingTime += additionalSeconds;
            this.totalTime += additionalSeconds;
            
            console.log(`Added ${minutes} minutes to timer`);
            
            // Update UI
            if (this.callbacks.onTick) {
                this.callbacks.onTick(this.remainingTime, this.totalTime);
            }
        }
    }

    /**
     * Get current timer state
     */
    getState() {
        return {
            isActive: this.isActive,
            remainingTime: this.remainingTime,
            totalTime: this.totalTime,
            remainingMinutes: Math.ceil(this.remainingTime / 60),
            progress: this.totalTime > 0 ? (this.totalTime - this.remainingTime) / this.totalTime : 0
        };
    }

    /**
     * Format time for display (MM:SS)
     */
    formatTime(seconds) {
        if (seconds <= 0) return '00:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * Format time for display with units (e.g., "5m 30s" or "1h 23m")
     */
    formatTimeWithUnits(seconds) {
        if (seconds <= 0) return '0s';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        
        let result = '';
        
        if (hours > 0) {
            result += `${hours}h `;
            if (minutes > 0) {
                result += `${minutes}m`;
            }
        } else if (minutes > 0) {
            result += `${minutes}m`;
            if (remainingSeconds > 0 && minutes < 5) {
                result += ` ${remainingSeconds}s`;
            }
        } else {
            result = `${remainingSeconds}s`;
        }
        
        return result.trim();
    }

    /**
     * Get warning thresholds for fade-out preparation
     */
    getWarningTime() {
        // Start fade-out 30 seconds before completion
        return 30;
    }

    /**
     * Check if timer is in warning period (near completion)
     */
    isInWarningPeriod() {
        return this.isActive && this.remainingTime <= this.getWarningTime();
    }

    /**
     * Get progress percentage (0-100)
     */
    getProgressPercent() {
        if (this.totalTime <= 0) return 0;
        return Math.round(((this.totalTime - this.remainingTime) / this.totalTime) * 100);
    }

    /**
     * Create timer from preset name
     */
    startPreset(presetName) {
        const minutes = this.presets[presetName];
        if (minutes) {
            this.start(minutes);
            return true;
        }
        return false;
    }

    /**
     * Get available presets
     */
    getPresets() {
        return { ...this.presets };
    }

    /**
     * Validate timer duration
     */
    validateDuration(minutes) {
        return minutes > 0 && minutes <= 480; // Max 8 hours
    }

    /**
     * Clean up timer resources
     */
    dispose() {
        this.cancel();
        this.callbacks = {
            onTick: null,
            onComplete: null,
            onCancel: null
        };
        
        console.log('TimerManager disposed');
    }
}

/**
 * Timer utility functions
 */
class TimerUtils {
    /**
     * Parse time string to minutes (supports formats like "1h 30m", "90m", "1.5h")
     */
    static parseTimeString(timeStr) {
        if (!timeStr || typeof timeStr !== 'string') return 0;
        
        const str = timeStr.toLowerCase().trim();
        let totalMinutes = 0;
        
        // Match hours (1h, 1.5h, etc.)
        const hoursMatch = str.match(/(\d+(?:\.\d+)?)\s*h/);
        if (hoursMatch) {
            totalMinutes += parseFloat(hoursMatch[1]) * 60;
        }
        
        // Match minutes (30m, etc.)
        const minutesMatch = str.match(/(\d+(?:\.\d+)?)\s*m/);
        if (minutesMatch) {
            totalMinutes += parseFloat(minutesMatch[1]);
        }
        
        // If no units specified, assume minutes
        if (!hoursMatch && !minutesMatch) {
            const numberMatch = str.match(/^(\d+(?:\.\d+)?)$/);
            if (numberMatch) {
                totalMinutes = parseFloat(numberMatch[1]);
            }
        }
        
        return Math.round(totalMinutes);
    }

    /**
     * Format minutes to human readable string
     */
    static formatMinutes(minutes) {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (remainingMinutes === 0) {
            return `${hours}h`;
        }
        
        return `${hours}h ${remainingMinutes}m`;
    }

    /**
     * Get suggested timer durations for UI
     */
    static getSuggestedDurations() {
        return [
            { value: 15, label: '15 minutes', short: '15m' },
            { value: 30, label: '30 minutes', short: '30m' },
            { value: 45, label: '45 minutes', short: '45m' },
            { value: 60, label: '1 hour', short: '1h' },
            { value: 90, label: '1.5 hours', short: '1.5h' },
            { value: 120, label: '2 hours', short: '2h' },
            { value: 180, label: '3 hours', short: '3h' },
            { value: 240, label: '4 hours', short: '4h' }
        ];
    }
}