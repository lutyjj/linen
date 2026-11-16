# Changelog

## [0.4.0](https://github.com/lutyjj/linen/compare/v0.3.0...v0.4.0) (2026-11-16)


### ⚠ BREAKING CHANGES

* WarnDot is gone; a state that wants attention is a Status with tone="warn".
* a Field child given as a function is handed { id, aria-describedby, aria-invalid } to spread on its control, instead of the id alone. CellSelect takes aria-invalid and aria-describedby instead of invalid.
* SegmentedControl and SearchField take onValueChange instead of onChange, OptionCards takes onValueChange instead of onChoose, and SelectToggle takes onCheckedChange(checked, range) instead of onToggle(range). ConfirmDialog and EmptyState take description instead of detail, and CardOption has description instead of detail. FormDialog takes confirmLabel and onConfirm instead of submitLabel and onSubmit, and PromptDialog takes defaultValue instead of initial. Choice and ChoiceGroup are exported from the root as before, and are generic over their value.
* OptionCards takes suggested and suggestedMark instead of proposed and proposedMark. --height-record, --height-row and --height-row-compact are gone.
* classes() resolves conflicts only on the properties linen's components set. An app that merges its own classes on other properties uses tailwind-merge itself.
* LinenProvider no longer holds toasts. An app that calls useToast wraps its tree in ToastProvider, inside LinenProvider.
* Button, IconButton, Card, SettlingTr and SettlingItem no longer take Motion's props; an app that animated one wraps it in an m element (LinenProvider runs Motion strict, so m, not motion). series() and EASE are gone. Motion is an optional peer: an app that animates with linen installs motion, and one that does not resolves it to linen/still.

### Features

* a field says why its value was refused ([09ef7cc](https://github.com/lutyjj/linen/commit/09ef7cc21b447e918779ab4ed9d74a767cbd0701))
* a strict style policy needs no nonce for linen ([d1a176f](https://github.com/lutyjj/linen/commit/d1a176fdb4a085b1cea69880a90f694d079cd019))
* a trail's folded steps open as a list of links ([ce4fabb](https://github.com/lutyjj/linen/commit/ce4fabb990d1249d9f6dfea1a9079d2e94edfcb6))
* blocks that say what state the app is in ([b5eb36d](https://github.com/lutyjj/linen/commit/b5eb36d3c4732e534b53613bc4f82b1504fc34d9))
* LinenProvider passes a page's nonce to Base UI ([9f8dedd](https://github.com/lutyjj/linen/commit/9f8deddd37945afac3694c0cf6fdecba8fe13bf4))
* Motion is an optional peer, and linen's props are its own ([a1b2d90](https://github.com/lutyjj/linen/commit/a1b2d90a7b6c5e5189092f024ef9118e6358f4b4))
* one vocabulary for every component, and the states they lacked ([2223c9d](https://github.com/lutyjj/linen/commit/2223c9d53659f73c33fab32e89c56a7cd96ad951))
* OptionCards suggests an answer, and unused heights are gone ([973af29](https://github.com/lutyjj/linen/commit/973af29789879689e6cbdcb1b86e8ed29da609e3))
* toasts are opt-in through ToastProvider ([ea08c1c](https://github.com/lutyjj/linen/commit/ea08c1c2c699e895225ca2555414294b1b949dd5))


### Performance Improvements

* classes() merges with only the class groups linen writes ([1e080a0](https://github.com/lutyjj/linen/commit/1e080a0196a899fc23edce6351d71346d112b29b))
* Motion's features load after the first paint ([85d5970](https://github.com/lutyjj/linen/commit/85d59705df36689ff7c499bd0460ff7ecea9790c))

## [0.3.0](https://github.com/lutyjj/linen/compare/v0.2.0...v0.3.0) (2026-11-15)


### Features

* linen/still stands in for Motion ([5702023](https://github.com/lutyjj/linen/commit/570202304e9b626fba4a88b5f31b36ae68f132a5))

## [0.2.0](https://github.com/lutyjj/linen/compare/v0.1.1...v0.2.0) (2026-11-15)


### ⚠ BREAKING CHANGES

* Place, Home, Crumb and Section take `href` instead of `to`. An app on React Router passes `navigation={reactRouter}` to LinenProvider, or its links load whole pages.

### Features

* linen links follow the app's router through a navigation adapter ([1aa11bc](https://github.com/lutyjj/linen/commit/1aa11bc730ffa7f5cbf50a1e821c29813d9d54f5))
