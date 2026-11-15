# Changelog

## [0.2.0](https://github.com/lutyjj/linen/compare/v0.1.1...v0.2.0) (2026-11-15)


### ⚠ BREAKING CHANGES

* Place, Home, Crumb and Section take `href` instead of `to`. An app on React Router passes `navigation={reactRouter}` to LinenProvider, or its links load whole pages.

### Features

* linen links follow the app's router through a navigation adapter ([1aa11bc](https://github.com/lutyjj/linen/commit/1aa11bc730ffa7f5cbf50a1e821c29813d9d54f5))
