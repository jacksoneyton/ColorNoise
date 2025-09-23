/**
 * ColorNoise Presets Data
 *
 * This file contains all preset data for ColorNoise.
 * When you add new preset JSON files to the Presets folder,
 * run: node update-preset-manifest.js
 *
 * This will update both manifest.json and this presets.js file.
 *
 * IMPORTANT: This file is automatically included in index.html to avoid CORS issues
 * when opening the HTML file directly with file:// protocol.
 */

// Make presets available globally for the preset loader
window.ColorNoisePresets = [
    {
        "id": "warm_white",
        "name": "Deep and Warm",
        "description": "Custom preset: Deep and Warm",
        "data": {
            "eq": {
                "subbass": 1,
                "bass": 20,
                "lowbass": 15,
                "lowmid": -8,
                "mid": 4.4,
                "uppermid": 8.6,
                "lowtreble": -22.7,
                "treble": -29.5,
                "air": -30,
                "ultrahigh": -30
            },
            "effects": {
                "reverb": 100,
                "spatial": 100,
                "warmth": 100,
                "saturation": 72,
                "dynamics": 57,
                "modulation": 0
            },
            "volume": 100
        },
        "builtin": true
    },
    {
        "id": "deep_focus",
        "name": "Deep Focus",
        "description": "Warm brown noise optimized for concentration and productivity",
        "data": {
            "eq": {
                "subbass": 8,
                "bass": 10,
                "mid": 5,
                "treble": -12
            },
            "effects": {
                "reverb": 35,
                "spatial": 25,
                "warmth": 60,
                "dynamics": 70
            },
            "volume": 65
        },
        "builtin": true
    },
    {
        "id": "natural_rain",
        "name": "Natural Rain",
        "description": "Pink noise shaped to sound like gentle rainfall",
        "data": {
            "eq": {
                "subbass": 5,
                "bass": 8,
                "mid": 2,
                "treble": -6
            },
            "effects": {
                "reverb": 55,
                "spatial": 65,
                "warmth": 40,
                "dynamics": 55
            },
            "volume": 70
        },
        "builtin": true
    },
    {
        "id": "ocean_waves",
        "name": "Ocean Waves",
        "description": "Gentle ocean waves with deep bass and spatial ambience",
        "data": {
            "eq": {
                "subbass": 15,
                "bass": 12,
                "mid": -3,
                "treble": -8
            },
            "effects": {
                "reverb": 65,
                "spatial": 75,
                "warmth": 45,
                "dynamics": 40
            },
            "volume": 75
        },
        "builtin": true
    }
];

// Also trigger preset loading if the preset loader is already initialized
if (window.presetLoader && typeof window.presetLoader.loadPresetsFromData === 'function') {
    window.presetLoader.loadPresetsFromData(window.ColorNoisePresets);
}