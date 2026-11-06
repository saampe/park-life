# Publishing Park Life

Current production: https://saampe.github.io/park-life/. Stage 1A proposes source-based publishing; this draft PR does not deploy or merge anything into main.

## Repository source (replacement)

The checked-in `site/` directory is the authoritative application source. `npm run check` validates, tests and copies its original bytes into `_site/`, adding only `.nojekyll`. No framework build or external application ZIP is needed.

On an approved merge into main, **Publish Park Life** stages repository source and publishes `_site/` via the existing official Pages actions. Source, scripts, tests, checksum or publishing-workflow changes trigger the workflow. Manual publishing on main defaults to `deployment_source: repository`.

PRs run **Validate recovered baseline**, which checks the same source artifact and uploads it as `park-life-pages-baseline` for review. It has read-only repository permissions, no Pages environment, and no production deployment step.

## Retained legacy fallback

Do not remove this fallback until the repository-source production deployment and browser checks have been verified. In **Actions → Publish Park Life → Run workflow**, select branch **main** and `deployment_source: legacy-archive`. The workflow downloads the exact original package from Drive file `1TovlCKLijZWTPn5gfF2dtoU0xQySYcGP` with the existing `gdown==5.2.0` route, verifies SHA-256 `855d8dcdcc03ae2684a618d52f82d166ecd7a95c9bb33d78257ede52bcccce57`, tests/extracts it, and deploys using the original Pages actions. This branch skips repository tests/build so it remains useful if a future repository build breaks.

The fallback is explicit, never a silent substitute for a failed source validation. A changed external ZIP is rejected rather than published. The external file and Google availability remain a fallback-only operational risk.

The workflow before Stage 1A is preserved verbatim in `docs/recovery/pages-before-stage-1a.yml`. The earlier root-ZIP-upload instructions did not describe the actual active workflow, which fetched the Google Drive ZIP. This document now reflects both the checked-in source and the retained download route.

## Verification boundary

Stage 1A verifies the source artifact locally and through draft-PR CI. It does not trigger a production deployment, change Pages settings, or merge into main. Production publishing and visual/browser equivalence remain pending the user's review and approval. Successful unit tests or HTTP checks alone do not establish Safari rendering correctness.
