/**
 * ColorNoise Preset Database Sync
 *
 * Automatically syncs the preset database with JSON files in the Presets folder.
 * - Adds new JSON files to database
 * - Updates existing presets if JSON files changed
 * - Removes presets from database if JSON files are deleted
 *
 * Usage:
 *   node sync-presets.js
 */

const fs = require('fs');
const path = require('path');

const presetsDir = path.join(__dirname, 'Presets');
const databasePath = path.join(presetsDir, 'presets.json');

function syncPresetDatabase() {
    try {
        console.log('🔄 Syncing preset database with Presets folder...');

        // Get all JSON files in Presets directory (excluding database files)
        const files = fs.readdirSync(presetsDir);
        const presetFiles = files.filter(file =>
            file.endsWith('.json') &&
            file !== 'presets.json' &&        // Exclude database file
            file !== 'manifest.json' &&      // Exclude old manifest
            !file.startsWith('.')             // Exclude hidden files
        );

        console.log(`📁 Found ${presetFiles.length} preset files:`, presetFiles);

        // Load existing database
        let database = [];
        if (fs.existsSync(databasePath)) {
            database = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
            console.log(`🗄️ Current database has ${database.length} presets`);
        }

        // Create new database from files
        const newDatabase = [];
        const addedPresets = [];
        const updatedPresets = [];

        presetFiles.forEach(filename => {
            try {
                const filePath = path.join(presetsDir, filename);
                const presetData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                // Validate preset structure
                if (!presetData.name || (!presetData.eq && !presetData.effects)) {
                    console.warn(`⚠️ Skipping ${filename}: Invalid preset structure`);
                    return;
                }

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
                    created: presetData.created || new Date().toISOString(),
                    updated: new Date().toISOString()
                };

                // Check if this is new or updated
                const existingPreset = database.find(p => p.id === preset.id);
                if (existingPreset) {
                    // Keep original creation date
                    preset.created = existingPreset.created;

                    // Check if actually changed
                    if (JSON.stringify(existingPreset.data) !== JSON.stringify(preset.data) ||
                        existingPreset.name !== preset.name ||
                        existingPreset.description !== preset.description) {
                        updatedPresets.push(preset.name);
                    } else {
                        // No changes, keep original updated date
                        preset.updated = existingPreset.updated;
                    }
                } else {
                    addedPresets.push(preset.name);
                }

                newDatabase.push(preset);

            } catch (error) {
                console.warn(`⚠️ Error processing ${filename}:`, error.message);
            }
        });

        // Find removed presets
        const removedPresets = database.filter(dbPreset =>
            !presetFiles.some(file => file.replace('.json', '') === dbPreset.id)
        ).map(p => p.name);

        // Sort new database by name
        newDatabase.sort((a, b) => a.name.localeCompare(b.name));

        // Write updated database
        fs.writeFileSync(databasePath, JSON.stringify(newDatabase, null, 2));

        // Report changes
        console.log('\n✅ Database sync completed!');
        console.log(`📊 Total presets: ${newDatabase.length}`);

        if (addedPresets.length > 0) {
            console.log(`➕ Added (${addedPresets.length}):`, addedPresets);
        }

        if (updatedPresets.length > 0) {
            console.log(`🔄 Updated (${updatedPresets.length}):`, updatedPresets);
        }

        if (removedPresets.length > 0) {
            console.log(`🗑️ Removed (${removedPresets.length}):`, removedPresets);
        }

        if (addedPresets.length === 0 && updatedPresets.length === 0 && removedPresets.length === 0) {
            console.log('✨ No changes detected - database is up to date');
        }

        console.log('\n📋 Current presets in database:');
        newDatabase.forEach(p => console.log(`   - ${p.name}`));

    } catch (error) {
        console.error('❌ Sync error:', error.message);
        process.exit(1);
    }
}

// Run the sync
syncPresetDatabase();