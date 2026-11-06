# Park Life

A browser-local cartoon shark world, currently published at https://saampe.github.io/park-life/. The website is public; generated world state stays in the visitor's browser. No Gmail, calendar, or weather account is connected.

This Stage 1A baseline recovers the approved existing application. **Gameplay, exterior artwork, interior, and animations are unchanged.** Stage 1B requires explicit approval.

## Run locally

Requirements: Python 3.12 and Node.js 22 or later for validation/tests. The app itself needs only a modern browser. No `npm install`, framework, bundler, runtime dependencies, or secrets are needed.

```sh
npm run dev
```

Open http://127.0.0.1:4173/. Without Node, use `python3 -m http.server 4173 --bind 127.0.0.1 --directory site`.

## Validate and stage

```sh
npm run check
```

This runs the 12 recovered rule tests, JavaScript syntax checks, all 20 source checksums, 15 asset checksums, PNG integrity and local-reference checks, six new tooling tests, and a byte-preserving `_site/` build. It then serves a temporary local HTTP fixture under `/park-life/` and checks every staged file, JavaScript MIME types, and the index route. HTTP success is not browser rendering or Safari verification.

`npm test`, `npm run validate`, and `npm run build` are also available separately. `_site/` is generated and ignored. Do not edit it.

## Structure

- `site/`: all 20 files from the approved deployed ZIP, byte-for-byte (HTML, three JavaScript modules, CSS, fourteen PNGs, sprite metadata).
- `tests/world.test.js`: original twelve development tests; only the module path changes from `dist/` to `site/`.
- `tests/baseline_test.py`: six new recovery/build validation tests; no gameplay changes.
- `scripts/`: standard-library checksum/reference validation, static artifact staging and local HTTP checks.
- `checksums/`: SHA-256 manifests for the full deployed baseline and all assets.
- `docs/recovery/`: provenance, original workflow, source/test inventory, limitations, Graphify status, and untouched historical developer records.
- `.github/workflows/baseline.yml`: PR/source validation and an artifact for review; never publishes.
- `.github/workflows/pages.yml`: source-based Pages publishing on main, with explicit legacy ZIP fallback retained.

See [Stage 1A recovery report](docs/recovery/STAGE-1A.md), [provenance](docs/recovery/provenance.json), [Graphify coverage](docs/recovery/GRAPHIFY.md), and [publishing instructions](PUBLISHING.md).

## Source and artwork policy

The workflow-referenced deployment archive is authoritative for runtime files. The original development archive was also still available in the conversation workspace; every deployed file matches it exactly. It supplies genuine original tests and historical documentation, clearly separated under `docs/recovery/development/`. Those historical scripts/reports include old workspace paths and are records, not the supported development workflow.

Do not regenerate, resize, recompress, or replace approved images. `checksums/assets.sha256` locks their original bytes. In later explicitly authorized stages, runtime code changes will need deliberate baseline manifest updates; keep historical provenance intact and preserve the approved asset hashes.
