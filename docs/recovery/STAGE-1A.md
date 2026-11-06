# Park Life v2 — Stage 1A recovery report

Scope: repository baseline and source recovery only. No Stage 1B, gameplay, performance, interior, animation, integration, or visual improvements were implemented. Work is isolated on `stage-1a/source-recovery` and proposed in a draft pull request; main is not merged or deployed by this task.

## Repository before recovery

Base commit: `8a428654588b9b537bbad99cb329f2daace58a28`. Only three tracked files existed: `README.md` (a title), `PUBLISHING.md`, and `.github/workflows/pages.yml`. No AGENTS.md, application source, tests, dependency manifest, assets, or development commands were present.

The active Pages workflow fetched Drive file `1TovlCKLijZWTPn5gfF2dtoU0xQySYcGP` using `gdown==5.2.0`, tested and unzipped it into `_site/`, added `.nojekyll`, then used configure/upload/deploy Pages actions. It ran only on main pushes affecting the workflow or PUBLISHING.md, or manual dispatch. The publishing notes still described uploading a ZIP to the repository root, which did not match the actual workflow. Latest existing production workflow run `42214861546` succeeded at the base commit; this observation is not verification of the proposed replacement.

## Recovery sources and verification

1. **Authoritative deployed archive:** `Park-Life-GitHub-Pages.zip`, 10,952,736 bytes, retrieved through connected Google Drive using the exact file id referenced by the workflow. SHA-256: `855d8dcdcc03ae2684a618d52f82d166ecd7a95c9bb33d78257ede52bcccce57`. ZIP CRC validation passed, with twenty files and no additional tests or development documentation.
2. **Additional original development archive:** `Park-Life-source.zip`, 20,265,707 bytes, SHA-256 `ec7b505f60db280d550899704359691093c85004461f7ce1e5c3f9b40c24e3bc`. This was genuinely still available in the shared workspace from the original development conversation; it was not retrieved from the deployment workflow or invented from memory. ZIP CRC validation passed. Every one of its twenty runtime files matches the deployed archive byte-for-byte.
3. **Live production comparison:** all twenty files at `https://saampe.github.io/park-life/` returned HTTP 200 with matching SHA-256 hashes. See `live-file-verification.json` for observation time, URLs and hashes. This is byte-level HTTP verification, not browser rendering verification.

`provenance.json` records source paths, hashes, sizes and origin for every recovered deployed file and eleven additional developer files. The ZIPs are not a build dependency and are not duplicated into Git. The generated standalone `Park-Life.html` export from the development ZIP is deliberately not imported: it duplicates the recovered application and is not an additional editable source. Original raw historical records are retained under `development/`, including the unmodified original test file and helper scripts.

## Recovered structure

- `site/index.html`, `site/style.css`: original UI and styling.
- `site/app.js`: original DOM controls, simulation coordination and local persistence.
- `site/world.js`: original pure rule/state functions.
- `site/scene.js`: original Canvas renderer and animation coordination.
- `site/assets/`: fourteen original PNG files plus `sprites.json` (fifteen asset files total).
- `tests/world.test.js`: twelve recovered original rule tests. Only imports are relocated from `../dist/world.js` to `../site/world.js`; assertions and behavior are unchanged.
- `tests/baseline_test.py`: six new Stage 1A tests for validation and build tooling.
- `scripts/validate.py`, `build_site.py`, `check_pages.py`: new dependency-free development/deployment checks.
- `docs/recovery/development/`: eleven original development records, retained verbatim for provenance, not presented as newly verified source workflow.

## Original art preservation

All twenty deployed files, including every illustration and sprite, are byte-identical to the archive and live deployment. There was no image generation, resizing, recompression, sprite replacement, source formatting, or gameplay editing in this stage.

`checksums/deployed-files.sha256` locks the full twenty-file baseline; `checksums/assets.sha256` separately records all fifteen asset hashes. PNG signatures, chunk CRCs, dimensions and end markers are checked using the Python standard library. Key exterior files:

- `site/assets/approved.png`: `575fdd7fbabcf5fad0736769754cae27ec628c49d620050e5cc1e82cb4259a08`
- `site/assets/park.png`: `bc89c0ed6ef424d0af5080d81e7bd9f0db23b4a7edb7b5dace51af19c7bdb0c4`

The interior, winter scene, animation body/leg pieces, fish, object sheet, controls and leaf sprite are also preserved exactly. The build is a copy, not a raster/JavaScript transformation.

## Changes in this PR

1. Import all twenty authoritative application files under `site/` with original bytes.
2. Recover original tests and historical developer records; record the exact archives and per-file provenance.
3. Add both checksum manifests, strict source inventory, asset integrity checks, local reference checks and safe static artifact staging.
4. Add six new validation tests and project-prefix HTTP smoke checks; add simple `npm` commands without dependencies or an install step.
5. Replace the bare README and stale publishing notes with reproducible instructions and explicit verification boundaries.
6. Add draft-PR CI to run the checks and upload a review artifact without publishing.
7. Change Pages' proposed default to repository source and source-related trigger paths; restrict publishing to main.
8. Retain the original Google Drive fallback as an explicit manual choice, pin its ZIP SHA-256, and preserve the complete old workflow verbatim. The fallback skips source validation/build to remain usable if a future source build fails.
9. Document Graphify's accessible but stale/incomplete graph and the exact reindex scope.

## Test results at source freeze

| Check | Result | Evidence/limit |
|---|---|---|
| Recovered original rule tests | **Passed: 12; failed: 0; skipped: 0** | `npm test`; original assertions retained |
| New baseline tooling tests | **Passed: 6; failed: 0; skipped: 0** | `npm run test:tooling`; changed art, missing modules, extra files and unsafe build destinations are rejected |
| JavaScript syntax | **Passed: 3 modules** | `node --check` on app/world/scene |
| Source inventory and SHA-256 | **Passed: 20 files** | Deployed baseline manifest |
| Asset SHA-256/PNG integrity | **Passed: 15 assets, 14 PNGs** | Original binary bytes, chunk CRCs and PNG structure |
| Archive/live/source equality | **Passed: 20/20 runtime files** | Workflow archive, retained developer archive, imported files and live production |
| Static Pages artifact | **Passed** | Exactly twenty unchanged files plus `.nojekyll` |
| Local Pages-prefix HTTP | **Passed: 21 files plus index route** | All bodies match; JavaScript MIME types accepted under `/park-life/` |
| GitHub Actions replacement CI | **Reported by draft PR checks** | Same `npm run check`, Node 22/Python 3.12, artifact uploaded without production publishing |
| Production source deployment | **Not run / intentionally skipped** | User requested draft PR, no main merge; fallback retained |
| Browser/Safari/mobile/visual/E2E tests | **Unavailable in recovered suites; not run** | No such original tests recovered and no supported interactive browser tool callable in this session |

Local execution uses Node 24.22.1 and Python 3.12.14; CI explicitly exercises Node 22/Python 3.12. No framework or runtime dependency was added. Expected red tests during validation-tool development are not final failures. No final failing tests are omitted.

## Missing sources, coverage gaps and risks

- Original tests and eleven developer records **were** recovered. They are not absent merely because the deployment ZIP omitted them.
- Editable artwork authoring projects, source layers beyond the delivered PNG sprites, asset generation prompts and earlier discarded designs are not supplied by either archive. Do not claim these are recovered or recreate them during baseline work.
- Historical `prepare_assets.py` and `build_standalone.py` refer to the old `dist/` tree and/or workspace-specific files. They remain verbatim archival records, not supported build commands. The complete runtime needs neither script: included PNGs and `site/` are sufficient.
- Existing rule tests do not exercise DOM wiring, Canvas rendering, sprite seams, frame timing, mobile layouts, device storage behavior, Safari or end-to-end browser interactions. Existing bugs in those areas are not silently fixed here.
- Full immutable runtime checksums are deliberate for this import stage. Future authorized source changes require a reviewed manifest policy/update; keep original provenance and approved asset hashes intact.
- CI staging and HTTP equivalence do not prove the first source-based production deployment. Keep the legacy fallback until the user approves migration and production/browser checks pass.
- The fallback still depends on Google Drive, Google availability and gdown. Default repository publishing removes that application-ZIP dependency after approved merge; fallback pinning intentionally rejects an altered archive.
- Public Pages hosting and browser-local saves are the existing architecture. No authentication, account integrations, sync, secrets or private server were introduced.
- Graphify currently describes an older eight-node repository shell. See `GRAPHIFY.md`; do not use empty graph results as evidence that recovered code is missing.

## Stage 1B recommendations — not implemented

1. Reindex the reviewed recovery commit (or an approved merge) and verify runtime/test symbols, imports and snapshot SHA.
2. Establish repeatable desktop/mobile/Safari browser smoke tests and screenshots using the unchanged approved exterior as visual truth.
3. Record current animation/interior behavior, seams, activity transitions, storage boundaries and performance before selecting changes.
4. Agree on a policy for intentional code checksum updates while keeping approved artwork hashes fixed.
5. After an explicitly approved source deployment, compare production file hashes and browser behavior, then separately decide whether to retire the external ZIP fallback.

Do not begin Stage 1B without explicit user approval.
