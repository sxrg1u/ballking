# Ballking

Pixel football idle game for the browser.

Ravi, 14, from Mumbai passes a ball against a wall. Every pass makes him better.
Upgrade pass speed, technique, ball control, stamina and the number of balls,
buy gear, coaches and new training grounds, and climb a ladder of 55 real
football players. Lionel Messi waits at rating 99, roughly 135 hours of active
training away. After that it never ends.

- Training only runs while the tab is open and visible (no offline progress).
- Saves automatically in your browser. Export/Import in Settings.

## Play

**Play online: https://sxrg1u.github.io/ballking/**

Or run it locally:

```bash
python3 -m http.server 8000
```

## Balancing

All numbers live in `js/config.js`. After changing them run:

```bash
node tools/calibrate.js
```

The tool simulates a player and rewrites `js/ratingTable.js` so each rating is
reached at its target play time.

## Files

| File | Purpose |
|---|---|
| `js/engine.js` | Game logic (no DOM, also used by the calibration tool) |
| `js/config.js` | Upgrades, grounds, coaches, gear |
| `js/stars.js` | Player ladder, kits, countries |
| `js/scene.js`, `js/sprites.js`, `js/backgrounds.js` | Pixel graphics and animation |
| `js/ui.js`, `js/main.js` | Menus, HUD, game loop |
| `js/audio.js` | Generated sound effects and chiptune music |
| `js/save.js`, `js/format.js` | Saving, number formatting |

## Disclaimer

Unofficial fan game. Not affiliated with, endorsed by or connected to any
player, club, league or federation. Player names are only used as career
milestones; all graphics are generic pixel figures without logos.
