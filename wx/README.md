# Universe Eater ? WeChat Mini Game

The `wx/` directory is a ready-to-import Mini Game project. It uses the existing
AppID in `project.config.json` and runs in portrait orientation.

## Build

From the repository root:

```powershell
npm install
npm run build:wx
npm run test:wx
```

`build:wx` generates `wx/bundle.js`. Use `npm run watch:wx` while editing the game.
No npm build step is needed inside WeChat DevTools: dependencies are bundled.

## Open in WeChat DevTools

1. Import a **Mini Game** project from `E:\universe-eater\wx` (not the repository root).
2. Use the AppID already stored in `project.config.json` and sign in with an account
   that has access to that project. This configuration is not a tourist/test AppID.
3. Click **Compile** to launch the portrait simulator.
4. Use **Preview** and scan its QR code with WeChat to test on your phone.

The project remains pinned to the configured base library `3.4.0`.
Building locally does not upload or publish the game.

## Platform support

- All gameplay, ten-minute stages, enemies, upgrades, and evolved weapon effects.
- Canvas 2D entity bodies on WeChat; the browser's Three.js models and bloom are
  not included in this target. The singularity title and weapon graphics remain.
- Native touch joystick, dash, pause, haptics, and persistent settings/records.
- Safe-area and native menu capsule clearance for HUD controls.
- Window resize handling and automatic pause/touch cancellation when hidden.
- Procedural sound through native WebAudio when available; silence is a safe
  fallback on runtimes without that API. Audio suspends when the app is hidden.
- Cached background sprites use native offscreen canvases when available;
  the starfield still works without them.

The adapter uses the APIs described in [Tencent's official Mini Game API
reference types](https://github.com/wechat-miniprogram/minigame-api-typings).

## Verification

`npm run test:wx` loads the actual adapter and generated bundle in an isolated,
browser-free runtime with mocked WeChat APIs. It checks launch, drawing calls,
touch controls, safe-area layout, lifecycle, resize, and storage integration.
`npm run test:wx:visual` also renders the actual WeChat bundle through real
Canvas 2D in Playwright, saving title/gameplay screenshots to `test-artifacts/`.
It emulates the native API bridge; it is not WeChat DevTools. Neither check
replaces real-device visual, audio, and performance testing.

On a phone, check: title/start, movement while dashing, draft selection, pause,
background/return, audio toggles, and a later-stage upgraded arsenal. Confirm
that controls stay below the native menu and above the home indicator.

## Files

- `game.js`: entry point; loads the adapter before the game bundle.
- `game.json`: portrait orientation and runtime options.
- `project.config.json`: DevTools project and existing AppID.
- `adapter.js`: native API bridge used by the generated bundle.
- `bundle.js`: generated game; edit `src/` instead.
- `empty-three/`: build-time stubs for the browser-only 3D renderer.
