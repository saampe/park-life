# Graphify coverage — Stage 1A

Observed 2026-11-06 via the connected Graphify tools:

- Repository `saampe/park-life`, id `27a9edb0-92f4-4991-9caa-4e468900347e`, is authorized, queryable, status `ready`.
- Promoted build `a143f6da-53d3-41c4-b30e-81fd14abd4da`, commit `e1d5fe71d389c95ebce5a54f42f3630ab7c14b67`.
- Eight nodes and six edges; `code_context` available, `patterns` unavailable.
- Indexed at `2026-11-06T12:28:13.012236Z`.
- Stage 1A starts from newer main `8a428654588b9b537bbad99cb329f2daace58a28` (the newer commit only enabled initial Pages setup).
- Symbol search for `chooseActivity` returned no results before the recovery import. The recovered `site/world.js` contains that function: an empty graph result is not evidence the function does not exist.

## Reindex needed

The current promoted graph predates this expanded source tree and cannot describe the recovered runtime, imports, assets or tests. Reindex the Stage 1A PR head if branch snapshots are supported. Otherwise reindex after an explicitly approved future merge, not during Stage 1A. Required scope:

- `site/app.js`, `site/world.js`, `site/scene.js`, `site/index.html`, `site/style.css`.
- `tests/world.test.js`, `tests/baseline_test.py`, `scripts/*.py`.
- `package.json`, `.github/workflows/*.yml`, source/reference metadata and recovery documentation.
- Treat `site/assets/` as binary/reference inventory rather than source call-graph nodes.
- Exclude generated `_site/` and `docs/recovery/development/` from primary runtime symbol results; historical copies otherwise create duplicate stale symbols.

No reindex mutation tool is exposed in this session; no index update was claimed. Inspect the Git/filesystem source until a new graph reports the correct commit and expanded coverage. Repository access being ready does not mean the recovery branch is indexed.
