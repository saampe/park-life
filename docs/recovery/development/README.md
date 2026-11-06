# Park Life
A private, animated window into a tall shark's independent life in a suburban park.

## Open and try it
Open `Park-Life.html` in a modern desktop browser. All artwork and code are embedded. No account, internet connection, installation, analytics or remote service is needed. Browser privacy settings may prevent saving; the app tells you when saving is unavailable.

Choose **Try a day** to experiment with Stockholm time, weather, seasons, new email counts, calendar busy hours and time away. Each five pretend new emails gives a fish-delivered parcel and a game-chosen object. Preview changes stay separate from your saved world; **Return to your world** discards them. The house button looks inside/outside; routines also transition automatically. Use **His little life** to see discoveries and possessions.

No Gmail, calendar or weather service is connected. Weather is a sample until you choose a source after trying the app. Local time and date are real Europe/Stockholm time. Nothing reads messages, names or event titles. Real integrations are a later step.

While closed, the app does not execute: it reconstructs a plausible, bounded chapter on return. Sometimes nothing changes. No loneliness, neglect, care chores or penalties. State belongs to this browser/device; there is no cross-device sync.

## Source version
Run `python3 serve.py` from this folder and open the printed address (replace `0.0.0.0` with `localhost` on the same device). Or run `npm run dev`. Node is needed only for `npm test`, which uses the built-in runner. No production dependencies.

Regenerate the self-contained artifact with `python3 build_standalone.py`. Raster artwork is included under `dist/assets/`; original approved artwork is `dist/assets/approved.png`. Optional `prepare_assets.py` is an art-preparation record from the build environment, not required to run the app.

## Verification
Twelve rule tests cover parcel carry and invalid counts, busy-day influence, no-penalty and bounded absence, Stockholm DST/daylight, corrupt storage, live autonomous changes, simulation isolation and activity hydration. JavaScript syntax and asset references were checked. Original animation pieces reassemble to the approved shark raster exactly.

Browser-rendered visual QA remains blocked because this session did not expose the supported browser tool. See `design-qa.md`. This is a functional first prototype, not a claim of browser-verified production readiness.
