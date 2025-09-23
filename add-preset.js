/**
 * ColorNoise Preset Database Manager
 *
 * Add a new preset to the database from a JSON file.
 *
 * Usage:
 *   node add-preset.js <filename.json>
 *   node add-preset.js warm_white.json
 */

const fs = require('fs');
const path = require('path');

const presetsDir = path.join(__dirname, 'Presets');
const databasePath = path.join(presetsDir, 'presets.json');

function addPresetToDatabase(filename) {
    if (!filename) {
        console.error('❌ Please provide a filename: node add-preset.js <filename.json>');
        process.exit(1);
    }

    if (!filename.endsWith('.json')) {
        console.error('❌ File must be a .json file');
        process.exit(1);
    }

    const presetPath = path.join(presetsDir, filename);

    try {
        // Check if preset file exists
        if (!fs.existsSync(presetPath)) {
            console.error(`❌ File not found: ${presetPath}`);
            process.exit(1);
        }

        // Load the preset file
        const presetData = JSON.parse(fs.readFileSync(presetPath, 'utf8'));
        console.log(`📄 Loaded preset: ${presetData.name}`);

        // Load existing database
        let database = [];
        if (fs.existsSync(databasePath)) {
            database = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
        }

        // Create preset object
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
            created: new Date().toISOString()
        };

        // Check if preset already exists
        const existingIndex = database.findIndex(p => p.id === preset.id);
        if (existingIndex !== -1) {
            console.log(`🔄 Updating existing preset: ${preset.name}`);
            database[existingIndex] = preset;
        } else {
            console.log(`➕ Adding new preset: ${preset.name}`);
            database.push(preset);
        }

        // Sort by name
        database.sort((a, b) => a.name.localeCompare(b.name));

        // Write back to database
        fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));

        console.log('✅ Database updated successfully!');
        console.log(`📊 Total presets in database: ${database.length}`);
        database.forEach(p => console.log(`   - ${p.name}`));

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Get filename from command line
const filename = process.argv[2];
addPresetToDatabase(filename);