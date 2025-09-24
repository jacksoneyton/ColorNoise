# ColorNoise Presets

This directory contains the preset management system for ColorNoise - a collection of curated audio configurations that work with any noise type.

## Database System

The preset system uses a centralized JSON database approach:

- **`presets.json`** - Main database containing all approved presets
- **Individual JSON files** - Source files for database synchronization
- **Management scripts** - Node.js tools for database operations

## Database Structure

The `presets.json` file contains an array of preset objects:

```json
[
  {
    "id": "preset_id",
    "name": "Display Name",
    "description": "Preset description",
    "data": {
      "eq": { "subbass": 0, "bass": 0, "mid": 0, "treble": 0 },
      "effects": { "reverb": 40, "spatial": 50, "warmth": 30, "dynamics": 60 },
      "volume": 75
    },
    "builtin": true,
    "created": "2024-01-01T00:00:00.000Z",
    "updated": "2024-01-01T00:00:00.000Z"
  }
]
```

## Individual Preset Format

Individual JSON files use this simplified format:

```json
{
  "name": "Preset Name",
  "description": "Optional description",
  "eq": {
    "subbass": 0,
    "bass": 0,
    "mid": 0,
    "treble": 0
  },
  "effects": {
    "reverb": 40,
    "spatial": 50,
    "warmth": 30,
    "dynamics": 60
  },
  "volume": 75
}
```

## Management Workflow

### Adding New Presets
1. Create individual JSON file in `Presets/` directory (e.g., `new_preset.json`)
2. Run `node sync-presets.js` to update database
3. Commit and push changes for deployment

### Removing Presets
1. Delete the individual JSON file
2. Run `node sync-presets.js` to update database
3. Commit and push changes

### Management Scripts

- **`sync-presets.js`** - Synchronizes database with individual JSON files
- **`add-preset.js <id> <name>`** - Creates new preset file and updates database
- **`remove-preset.js <id>`** - Removes preset file and updates database
- **`update-index.js`** - Updates index.txt file listing (legacy)

## Community Submissions

Users can submit presets via Google Forms integration:
1. Users configure their ideal settings in ColorNoise
2. Submit via embedded Google Form with pre-filled data
3. Admin reviews submissions and adds approved presets
4. New presets become available to all users

## Current Presets

- **Deep and Warm** - Rich, warm sound with enhanced bass and full effects
- **Deep Focus** - Optimized for concentration with balanced processing
- **Natural Rain** - Pink noise shaped to mimic gentle rainfall
- **Ocean Waves** - Spatial ambience with oceanic characteristics

## Technical Notes

- **Color-agnostic**: All presets work with any noise type (pink, brown, white, green, blue)
- **CORS-friendly**: Single database file prevents cross-origin issues
- **Auto-loading**: Selected presets load automatically without manual Load button
- **Deployment**: Works seamlessly with both local development and CloudFlare Pages
- **SEO-protected**: Admin interface hidden via robots.txt

## Admin Access

Preset management is available through the secure admin interface at `/sys-config.html` with SHA-256 authentication. This interface is hidden from search engines and requires proper credentials.