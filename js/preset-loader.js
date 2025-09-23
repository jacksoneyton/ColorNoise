/**
 * ColorNoise Preset Loader
 * Integrates preset system with main UI
 */

class PresetLoader {
    constructor() {
        this.presets = [];
        this.init();
    }

    async init() {
        await this.loadFileBasedPresets();
        this.loadPresets();
        this.setupEventListeners();
        this.updatePresetSelector();
    }

    async loadFileBasedPresets() {
        console.log('🔍 Loading presets from database...');
        this.presets = [];

        // Try to load the preset database file
        try {
            console.log('🗄️ Loading preset database: Presets/presets.json');
            const response = await fetch('Presets/presets.json');
            console.log('📡 Database response status:', response.status, response.statusText);

            if (response.ok) {
                const presetDatabase = await response.json();
                console.log(`📊 Database loaded with ${presetDatabase.length} presets`);

                // Validate and load all presets from database
                presetDatabase.forEach(preset => {
                    if (preset.name && preset.data && (preset.data.eq || preset.data.effects)) {
                        this.presets.push(preset);
                        console.log(`✓ Loaded: ${preset.name}`);
                    } else {
                        console.warn(`⚠️ Invalid preset structure:`, preset);
                    }
                });

                // Sort presets by name
                this.presets.sort((a, b) => a.name.localeCompare(b.name));
                console.log(`✅ Successfully loaded ${this.presets.length} presets from database:`, this.presets.map(p => p.name));

                // Trigger UI update
                this.updatePresetSelector();
                return;
            } else {
                console.log(`❌ Database file failed: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('💥 Error loading preset database:', error);
        }

        // Final fallback: Use embedded presets
        console.log('🔄 Using embedded preset fallbacks...');
        await this.loadEmbeddedPresets();
        this.updatePresetSelector();
    }

    loadPresetsFromData(presetsData) {
        this.presets = [...presetsData];
        console.log(`📦 Loaded presets from data:`, this.presets.map(p => p.name));
        this.updatePresetSelector();
    }

    generatePotentialPresetNames() {
        // Generate a comprehensive list of potential preset filenames
        const baseNames = [
            // Known existing presets (ensure these are always included)
            'ocean_waves', 'deep_focus', 'natural_rain', 'warm_white',

            // Color + adjective combinations (comprehensive)
            'warm_white', 'cool_white', 'soft_white', 'bright_white', 'deep_white',
            'warm_pink', 'cool_pink', 'soft_pink', 'bright_pink', 'deep_pink',
            'warm_brown', 'cool_brown', 'soft_brown', 'bright_brown', 'deep_brown',
            'warm_blue', 'cool_blue', 'soft_blue', 'bright_blue', 'deep_blue',
            'warm_green', 'cool_green', 'soft_green', 'bright_green', 'deep_green',
            'warm_violet', 'cool_violet', 'soft_violet', 'bright_violet', 'deep_violet',
            'warm_gray', 'cool_gray', 'soft_gray', 'bright_gray', 'deep_gray',
            'warm_red', 'cool_red', 'soft_red', 'bright_red', 'deep_red',

            // Adjective + color combinations
            'gentle_white', 'smooth_white', 'rich_white', 'crisp_white',
            'gentle_pink', 'smooth_pink', 'rich_pink', 'crisp_pink',
            'gentle_brown', 'smooth_brown', 'rich_brown', 'crisp_brown',

            // Common descriptive words + noise types
            'cozy_white', 'peaceful_pink', 'soothing_brown', 'calming_blue',
            'energizing_white', 'focusing_pink', 'relaxing_brown', 'inspiring_blue',

            // Common ambient sounds
            'forest_ambience', 'cafe_noise', 'thunderstorm', 'wind_chimes',
            'city_rain', 'fireplace', 'mountain_breeze', 'library_quiet',
            'spaceship_hum', 'underwater', 'desert_wind', 'snow_falling',
            'night_crickets', 'waterfall', 'gentle_storm', 'cozy_cabin',

            // Focus and productivity
            'deep_work', 'study_mode', 'concentration', 'focus_zone',
            'productivity', 'brain_focus', 'work_flow', 'zen_focus',
            'morning_focus', 'evening_calm', 'meditation', 'mindfulness',

            // Sleep and relaxation
            'sleep_aid', 'bedtime', 'night_sounds', 'dream_state',
            'peaceful_sleep', 'slumber', 'rest_mode', 'lullaby',
            'deep_sleep', 'relaxation', 'calm_waves', 'gentle_breeze',

            // Nature sounds
            'forest_rain', 'mountain_stream', 'ocean_storm', 'desert_night',
            'jungle_sounds', 'arctic_wind', 'prairie_wind', 'cave_echoes',
            'river_flow', 'bird_songs', 'rustling_leaves', 'gentle_thunder',

            // Urban and modern
            'coffee_shop', 'train_journey', 'airport_ambience', 'city_night',
            'subway_ride', 'busy_street', 'quiet_library', 'office_hum',
            'fan_noise', 'air_conditioner', 'computer_fan', 'server_room',

            // Creative and artistic
            'creative_flow', 'artistic_inspiration', 'writing_mode', 'design_focus',
            'coding_zone', 'brainstorm', 'innovation', 'creative_space',

            // Seasonal and temporal
            'spring_rain', 'summer_night', 'autumn_wind', 'winter_storm',
            'morning_dew', 'afternoon_calm', 'evening_breeze', 'midnight_hour',

            // Community submissions (common patterns)
            'custom_preset', 'user_preset', 'my_preset', 'personal_mix',
            'favorite_sound', 'perfect_blend', 'ideal_noise', 'signature_sound',

            // Single word descriptors that might be used
            'warm', 'cool', 'soft', 'deep', 'gentle', 'smooth', 'rich', 'crisp',
            'cozy', 'peaceful', 'soothing', 'calming', 'energizing', 'focusing',
            'relaxing', 'inspiring', 'dreamy', 'mystical', 'ethereal', 'ambient'
        ];

        // Add numbered variations for community submissions
        for (let i = 1; i <= 50; i++) {
            baseNames.push(
                `preset_${i}`, `custom_${i}`, `submission_${i}`, `community_${i}`,
                `preset${i}`, `custom${i}`, `submission${i}`, `community${i}`
            );
        }

        // Add alphabet combinations (a-z, aa-zz)
        for (let i = 97; i <= 122; i++) {
            const letter = String.fromCharCode(i);
            baseNames.push(`preset_${letter}`, `custom_${letter}`, letter);
        }

        // Convert to .json filenames and remove duplicates
        const jsonFiles = [...new Set(baseNames.map(name => `${name}.json`))];

        console.log(`🔍 Will scan ${jsonFiles.length} potential preset files`);
        return jsonFiles;
    }

    async loadPresetsFromManifest(presetFilenames) {
        for (const filename of presetFilenames) {
            await this.tryLoadPresetFile(filename);
        }
    }

    async tryLoadPresetFile(filename) {
        try {
            console.log(`🌐 Fetching: Presets/${filename}`);
            const response = await fetch(`Presets/${filename}`);
            console.log(`📡 ${filename} response:`, response.status, response.statusText);

            if (response.ok) {
                const presetData = await response.json();
                console.log(`📄 ${filename} data:`, presetData);

                // Validate that it has required preset structure
                if (presetData.name && (presetData.eq || presetData.effects)) {
                    const preset = {
                        id: filename.replace('.json', ''),
                        name: presetData.name,
                        description: presetData.description || `Custom preset: ${presetData.name}`,
                        data: {
                            eq: presetData.eq || { subbass: 0, bass: 0, mid: 0, treble: 0 },
                            effects: presetData.effects || { reverb: 40, spatial: 50, warmth: 30, dynamics: 60 },
                            volume: presetData.volume || 75
                        },
                        builtin: true,
                        filename: filename
                    };

                    this.presets.push(preset);
                    console.log(`✅ Successfully loaded: ${presetData.name} (${filename})`);
                } else {
                    console.warn(`⚠️ ${filename} missing required fields (name + eq/effects)`, presetData);
                }
            } else {
                console.warn(`❌ Failed to load ${filename}: ${response.status}`);
            }
        } catch (error) {
            console.error(`💥 Error loading ${filename}:`, error);
        }
    }

    async loadEmbeddedPresets() {
        // Embedded presets for when file loading fails (CORS issues)
        const embeddedPresets = [
            {
                id: 'warm_white',
                name: 'Deep and Warm',
                description: 'Warm white noise with deep bass and rich effects',
                data: {
                    eq: { subbass: 1, bass: 20, mid: 4.4, treble: -29.5 },
                    effects: { reverb: 100, spatial: 100, warmth: 100, dynamics: 57 },
                    volume: 100
                },
                builtin: true
            },
            {
                id: 'ocean_waves',
                name: 'Ocean Waves',
                description: 'Gentle ocean waves with deep bass and spatial ambience',
                data: {
                    eq: { subbass: 15, bass: 12, mid: -3, treble: -8 },
                    effects: { reverb: 65, spatial: 75, warmth: 45, dynamics: 40 },
                    volume: 75
                },
                builtin: true
            },
            {
                id: 'deep_focus',
                name: 'Deep Focus',
                description: 'Warm brown noise optimized for concentration and productivity',
                data: {
                    eq: { subbass: 8, bass: 10, mid: 5, treble: -12 },
                    effects: { reverb: 35, spatial: 25, warmth: 60, dynamics: 70 },
                    volume: 65
                },
                builtin: true
            },
            {
                id: 'natural_rain',
                name: 'Natural Rain',
                description: 'Pink noise shaped to sound like gentle rainfall',
                data: {
                    eq: { subbass: 5, bass: 8, mid: 2, treble: -6 },
                    effects: { reverb: 55, spatial: 65, warmth: 40, dynamics: 55 },
                    volume: 70
                },
                builtin: true
            }
        ];

        this.presets = [...embeddedPresets];
        console.log('📦 Loaded embedded presets as fallback');
    }

    setupEventListeners() {
        // Event listeners for file-based preset system
        // (Currently no dynamic events needed since presets are loaded from static files)
    }

    loadPresets() {
        // Presets are now loaded from files only
        // This method is kept for compatibility but does nothing
        // since loadFileBasedPresets() handles all preset loading
    }

    updatePresetSelector() {
        const selector = document.getElementById('presetSelector');
        if (!selector) return;

        // Clear existing options except the first one
        selector.innerHTML = '<option value="">Select a preset...</option>';

        if (this.presets.length === 0) {
            const noPresetsOption = document.createElement('option');
            noPresetsOption.value = '';
            noPresetsOption.textContent = 'No presets available';
            noPresetsOption.disabled = true;
            selector.appendChild(noPresetsOption);
            return;
        }

        // Add all presets (all come from files now)
        this.presets.forEach(preset => {
            const option = document.createElement('option');
            option.value = preset.id;
            option.textContent = preset.name;
            option.title = preset.description || preset.name;
            selector.appendChild(option);
        });
    }

    findPresetById(presetId) {
        const preset = this.presets.find(p => p.id === presetId);
        return preset ? { preset } : null;
    }

    async loadPreset(presetId) {
        const result = this.findPresetById(presetId);
        if (!result) {
            this.showNotification('error', 'Preset not found');
            return false;
        }

        const { preset } = result;

        try {
            // Apply the preset settings
            await this.applyPresetData(preset.data);

            this.showNotification('success', `Loaded "${preset.name}" preset`);
            return true;

        } catch (error) {
            console.error('Error loading preset:', error);
            this.showNotification('error', 'Failed to load preset');
            return false;
        }
    }


    async applyPresetData(presetData) {
        // Apply EQ settings
        if (presetData.eq) {
            Object.entries(presetData.eq).forEach(([band, value]) => {
                const slider = document.getElementById(`eq-${band}`);
                const valueInput = document.getElementById(`val-${band}`);

                if (slider) {
                    slider.value = value;
                    // Trigger change event if the audio engine is listening
                    slider.dispatchEvent(new Event('input'));
                }

                if (valueInput) {
                    valueInput.value = value;
                }
            });
        }

        // Apply effects settings
        if (presetData.effects) {
            Object.entries(presetData.effects).forEach(([effect, value]) => {
                const slider = document.getElementById(effect);
                const valueInput = document.getElementById(`val-${effect}`);

                if (slider) {
                    slider.value = value;
                    slider.dispatchEvent(new Event('input'));
                }

                if (valueInput) {
                    valueInput.value = value;
                }
            });
        }

        // Apply any other settings (volume, etc.)
        if (presetData.volume !== undefined) {
            const volumeSlider = document.querySelector('.volume-slider, #masterVolume');
            if (volumeSlider) {
                volumeSlider.value = presetData.volume;
                volumeSlider.dispatchEvent(new Event('input'));
            }
        }
    }

    showNotification(type, message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `preset-notification preset-notification-${type}`;
        notification.textContent = message;

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: '500',
            fontSize: '14px',
            zIndex: '10000',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease',
            opacity: '0',
            transform: 'translateX(-50%) translateY(-20px)'
        });

        // Set colors based on type
        if (type === 'success') {
            notification.style.background = 'rgba(74, 222, 128, 0.1)';
            notification.style.color = '#4ade80';
            notification.style.borderColor = 'rgba(74, 222, 128, 0.3)';
        } else if (type === 'error') {
            notification.style.background = 'rgba(239, 68, 68, 0.1)';
            notification.style.color = '#ef4444';
            notification.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        }

        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(-50%) translateY(0)';
        });

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Global functions for HTML onchange handlers
function loadSelectedPreset() {
    const selector = document.getElementById('presetSelector');
    const presetId = selector.value;

    // If no preset selected (back to default), just return without error
    if (!presetId) {
        return;
    }

    // Automatically load the selected preset
    presetLoader.loadPreset(presetId);
}

// Initialize the preset loader
let presetLoader;
document.addEventListener('DOMContentLoaded', async () => {
    presetLoader = new PresetLoader();
});