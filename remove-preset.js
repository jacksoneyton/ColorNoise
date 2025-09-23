/**
 * ColorNoise Preset Removal Tool
 *
 * Remove a preset from both the JSON file and database.
 *
 * Usage:
 *   node remove-preset.js <preset-id>
 *   node remove-preset.js warm_white
 */

const fs = require('fs');
const path = require('path');

const presetsDir = path.join(__dirname, 'Presets');
const databasePath = path.join(presetsDir, 'presets.json');

function removePreset(presetId) {
    if (!presetId) {
        console.error('❌ Please provide a preset ID: node remove-preset.js <preset-id>');
        console.log('💡 Example: node remove-preset.js warm_white');
        process.exit(1);
    }

    try {
        console.log(`🗑️ Removing preset: ${presetId}`);

        // Load existing database
        if (!fs.existsSync(databasePath)) {
            console.error('❌ Database file not found: presets.json');
            process.exit(1);
        }

        const database = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
        const presetIndex = database.findIndex(p => p.id === presetId);

        if (presetIndex === -1) {
            console.error(`❌ Preset "${presetId}" not found in database`);
            console.log('📋 Available presets:');
            database.forEach(p => console.log(`   - ${p.id} (${p.name})`));
            process.exit(1);
        }

        const preset = database[presetIndex];
        console.log(`📄 Found preset: ${preset.name}`);

        // Remove JSON file if it exists
        const jsonFile = path.join(presetsDir, `${presetId}.json`);
        if (fs.existsSync(jsonFile)) {
            fs.unlinkSync(jsonFile);
            console.log(`🗂️ Deleted file: ${presetId}.json`);
        } else {
            console.log(`ℹ️ JSON file not found: ${presetId}.json (may have been already deleted)`);
        }

        // Remove from database
        database.splice(presetIndex, 1);

        // Write updated database
        fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));

        console.log('✅ Preset removed successfully!');
        console.log(`📊 Remaining presets: ${database.length}`);
        database.forEach(p => console.log(`   - ${p.name}`));

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Get preset ID from command line
const presetId = process.argv[2];
removePreset(presetId);