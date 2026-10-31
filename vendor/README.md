# Temporary dependency security fixes

The root overrides remain active for production and development installs. The
security audit still fails on every reported vulnerability, including low severity.

- `deepmerge` is a small, MIT-licensed fork of upstream 4.3.1 (`dist/cjs.js`).
  GHSA-gcqx-w48m-w2h4 has no published fixed version. The fork rejects `__proto__`,
  `constructor` and `prototype` keys from **both** merge inputs at every recursive
  level, including null-prototype targets. The original API and license are retained.
  It has its own package name/version; it does not masquerade as an upstream release.
- `file-type-compat` adapts Jimp 0.22's asynchronous `fromBuffer` API to the maintained
  `file-type` 22 parser. The parser remains a registry dependency (aliased as
  `file-type-modern`), visible to the audit. This fixes GHSA-5v7r-6r5c-r473 without
  forcing Jimp's unrelated API migration.
- `glob` 14.0.3 includes the upstream cancellation fix GHSA-3g3m-2fjr-6pw4.
  Its own minimatch 11 dependency is unchanged. Older minimatch consumers need the
  `makeRe` API removed in v11, so `minimatch` is a separately named, licensed fork of
  10.2.6 with the upstream 11.0.1 globparts cap and quadratic-pass limit backported
  to both CJS and ESM builds (GHSA-g3hv-75wg-m249, upstream commit `77a0f5c`).
  It also preserves the callable CJS export needed by older consumers.

`.npmrc` installs local packages as ordinary packages, with their dependencies,
instead of symlinks. Docker builds must copy this file and `vendor/` before `npm ci`.

Run `npm run test:dependency-guards` to exercise the security regressions and the
Jimp integration, followed by the frontend/backend test suites and the full audit.
Remove these overrides when upstream callers adopt compatible fixed dependencies;
keep the regression tests when replacing the temporary adapters.
