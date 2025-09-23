/**
 * ColorNoise Index Updater
 *
 * Automatically updates Presets/index.txt with all JSON files found in the Presets folder.
 * Run this whenever you add or remove preset files.
 *
 * Usage:
 *   node update-index.js
 */

const fs = require('fs');
const path = require('path');

const presetsDir = path.join(__dirname, 'Presets');
const indexPath = path.join(presetsDir, 'index.txt');

function updateIndex() {
    try {
        // Read all files in Presets directory
        const files = fs.readdirSync(presetsDir);

        // Filter for .json files (excluding non-preset files)
        const presetFiles = files.filter(file =>
            file.endsWith('.json') &&
            !file.startsWith('.')  // Ignore hidden files
        );

        // Sort alphabetically
        presetFiles.sort();

        // Write to index.txt
        const indexContent = presetFiles.join('\n');
        fs.writeFileSync(indexPath, indexContent);

        console.log('✅ Index updated successfully!');
        console.log(`📁 Found ${presetFiles.length} preset files:`);
        presetFiles.forEach(file => console.log(`   - ${file}`));
        console.log(`📝 Updated: Presets/index.txt`);

    } catch (error) {
        console.error('❌ Error updating index:', error.message);
        process.exit(1);
    }
}

// Run the update
updateIndex();