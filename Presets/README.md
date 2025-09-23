# ColorNoise Presets

This folder contains color-agnostic presets that work with any noise type.

## Structure

All preset files are stored directly in this folder as JSON files. The preset system no longer uses color-specific subfolders.

## Preset Format

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

## Management

Presets are managed through the admin interface at `/sys-config.html` with proper authentication.

## Sample Presets

- `ocean_waves.json` - Gentle ocean waves with deep bass and spatial ambience
- `deep_focus.json` - Warm settings optimized for concentration and productivity
- `natural_rain.json` - Pink noise shaped to sound like gentle rainfall

## Notes

- All presets work with any noise color (white, pink, brown, blue, violet, gray, red, green)
- Presets are stored in browser localStorage when imported via admin interface
- These files serve as backup/templates for manual preset creation