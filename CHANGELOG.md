# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-29

Initial release of Universe Eater.

### Added

- Project scaffolding with TypeScript, esbuild, and a core game loop
- Input handler for WASD/Arrow key movement and camera system
- Player entity wired into the game loop
- Deep space background with parallax starfield, nebulae, and cosmic dust
- 3 enemy types with a spawner system, escalating difficulty over 5 minutes, and HP bar fill visualization
- Enemy death particle effects with hollow-out and bubble-up animation
- 4th enemy type (total of 4 enemy variants)
- All 3 weapon types — Laser Beam, Orbit Shield, and Nova Blast — each with 10-level visual progression
- Game state machine covering play, level-up, victory, and game-over states
- XP/leveling system with level-up screen offering 3 weapon upgrade choices (selectable via 1/2/3 keys or click)
- HUD showing XP bar, player level, and survival timer

### Fixed

- Removed unused imports in `enemies.ts`
