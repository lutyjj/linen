# Changelog

## [0.8.0](https://github.com/lutyjj/linen/compare/v0.7.3...v0.8.0) (2026-11-18)


### ⚠ BREAKING CHANGES

* Words gains gaugeReading; an app that passes its own Words to LinenProvider adds it.

### Features

* a swap takes a className for its region ([2153b47](https://github.com/lutyjj/linen/commit/2153b47139e456ed9f2632f46120b26df72d89ad))
* the view a swap leaves hands the focus to the view that arrives ([2856fce](https://github.com/lutyjj/linen/commit/2856fce6aa46b6ab078a57d447ed64d4bc2bd006))


### Bug Fixes

* a card's actions go under its description once they crowd its title ([#29](https://github.com/lutyjj/linen/issues/29)) ([ac2adfb](https://github.com/lutyjj/linen/commit/ac2adfb7a1b886e2d065f72165f6c810d908bf39))
* a dialog body whose content fits draws no hairline ([7386a35](https://github.com/lutyjj/linen/commit/7386a355331f65b512a224b7f50f093f198dac19))
* a dialog that swaps its views stays inside the visible window ([#36](https://github.com/lutyjj/linen/issues/36)) ([f1fba34](https://github.com/lutyjj/linen/commit/f1fba340917106ca48c407dffc3a315611306a05))
* a gauge reads its marks out with its value ([a85260f](https://github.com/lutyjj/linen/commit/a85260fd314b1775912c21a290e7dfbf150716cb))
* a held mark at a gauge's lowest draws nothing ([aaae712](https://github.com/lutyjj/linen/commit/aaae71201d19ce397794eab01b92c35a396adffa))
* a notice declares no container ([f47aa6a](https://github.com/lutyjj/linen/commit/f47aa6a84988a2af5afa9ad79fb3422acbd39ce6))
* a set mark at either end of a gauge's scale draws whole ([cba943f](https://github.com/lutyjj/linen/commit/cba943f60a6da747b99b4aa4345e0e03aec79651))
* a status with nothing to explain is a plain status ([81b1d57](https://github.com/lutyjj/linen/commit/81b1d57b51f53c425fdda540b7b03f830e6116a0))
* what a screen scrolls to comes to rest below its sticky bars ([#39](https://github.com/lutyjj/linen/issues/39)) ([0fb700b](https://github.com/lutyjj/linen/commit/0fb700b51de252c34c4ae82356ce852c81108ecc))

## [0.7.3](https://github.com/lutyjj/linen/compare/v0.7.2...v0.7.3) (2026-11-17)


### Bug Fixes

* a gauge reads at a glance, its held and set marks apart ([#24](https://github.com/lutyjj/linen/issues/24)) ([04500c0](https://github.com/lutyjj/linen/commit/04500c045d03e1c4b190ccf36aaa8334ab10d246))
* a secret shown once wears the well a value to copy whole wears ([#22](https://github.com/lutyjj/linen/issues/22)) ([6b85c34](https://github.com/lutyjj/linen/commit/6b85c3445a1492410ea69a1d247f494cd391e3a5))

## [0.7.2](https://github.com/lutyjj/linen/compare/v0.7.1...v0.7.2) (2026-11-17)


### Bug Fixes

* a short title keeps its actions beside it on a phone ([8958bf6](https://github.com/lutyjj/linen/commit/8958bf65d7bd26d60fbf1dfe2bf9c71f92665648))

## [0.7.1](https://github.com/lutyjj/linen/compare/v0.7.0...v0.7.1) (2026-11-17)


### Bug Fixes

* an option or a box keeps its own name, and a card's line describes it ([a366459](https://github.com/lutyjj/linen/commit/a366459147f7ffc1258a1a804efc19c1758da29a))

## [0.7.0](https://github.com/lutyjj/linen/compare/v0.6.0...v0.7.0) (2026-11-16)


### ⚠ BREAKING CHANGES

* Shell no longer draws its foot at the end of a phone's bar. An app that relied on it there, for a theme choice or the account menu, offers the same choice on a screen a phone reaches, such as a settings screen, and keeps the foot for the rail.

### Features

* a fact's value ends its line, where a setting's control stands ([6d1c813](https://github.com/lutyjj/linen/commit/6d1c81349dbb62160ccacd639e8597bad9817dea))


### Bug Fixes

* a card draws one line at its edges ([9174a09](https://github.com/lutyjj/linen/commit/9174a09d479bde78ecd0a00986dc29ae30273268))
* a phone's bar holds the places alone ([010c846](https://github.com/lutyjj/linen/commit/010c846c33839e9701b54c0e1f2c5ea752d17557))
* a setting's control moves under its words once it does not fit beside them ([e398a5f](https://github.com/lutyjj/linen/commit/e398a5fdc611d87b3510e396956de3ef3f7dd28c))

## [0.6.0](https://github.com/lutyjj/linen/compare/v0.5.0...v0.6.0) (2026-11-16)


### ⚠ BREAKING CHANGES

* The shell's foot holds AccountMenu and RailChoice, which draw themselves for the rail and for each phone bar, and the tab bar no longer draws a cell around the foot: each part stands as a cell of its own. Pass the parts as siblings, in a fragment, not wrapped in an element. An app that put its own element in the foot moves it into the AccountMenu, among its choices or in its footer, or makes it a RailChoice; an element left there stands in the tab bar at its own size.

### Features

* a compact gauge for a row of a list ([47ff00a](https://github.com/lutyjj/linen/commit/47ff00a75638eca2650ce0105cf89df693aba975))
* a narrow field's messages may be wider than its control ([d7ed23f](https://github.com/lutyjj/linen/commit/d7ed23f40456f8b349df73acccdbf180cb33bb59))
* an ExplainedStatus says why its state holds ([be087c5](https://github.com/lutyjj/linen/commit/be087c58cc08b5f4a365374a25f679a7a79f3377))


### Bug Fixes

* a choice in the shell's foot stands in a phone's bar as a place does ([738d264](https://github.com/lutyjj/linen/commit/738d26437f30e1222b5fbd02b4f0e1f4e261067e))
* a gauge at its lowest reads as empty ([747b1e3](https://github.com/lutyjj/linen/commit/747b1e3acd534ea7d34d071bca7a786b66b76354))

## [0.5.0](https://github.com/lutyjj/linen/compare/v0.4.0...v0.5.0) (2026-11-16)


### ⚠ BREAKING CHANGES

* CheckGlyph and POPUP_SEARCH_CLASS are no longer exported; draw a box with SelectToggle or Checkbox. SelectToggle renders Base UI's checkbox (a span with role checkbox and a hidden input) in place of a button; its props are unchanged.
* Condition is a type, no longer a component. `<Conditions><Condition tone="danger" title="..." /></Conditions>` becomes `<Conditions conditions={[{ id: "contact", tone: "danger",
* a ToastMessage offers `onUndo` or `action`, not both; one with both no longer type-checks. Keep the answer the toast needs.
* ConfirmDialog, and with it the unsaved-work guard's question, has the role `alertdialog`: a test that finds it by role `dialog` finds it by `alertdialog`. A press beside it no longer closes it.
* a field's `error` prop is gone. An answer's refusal goes in `errors` on Form or FormDialog, keyed by the field's `name` (`<TextField name="port" />` in `<Form errors={{ port: "..." }}>`), held in state, set from every answer and never cleared as a submit starts. A check the app makes itself is the field's `validate`. Errors are strings. Field takes its control as a child instead of a function of FieldControl, and loses `id`: a Base UI control or CellInput, and a native element through Base UI's Input (`<Input render={<textarea />} />`), or it is not named or described. A standing error now refuses the next submit until its value is edited; a refusal that is not about the value goes in a Notice. SettingRow's child is a node, not a function of `describedBy`. Switch loses `aria-describedby`, and CellSelect loses `aria-describedby` and `aria-invalid`, which a field now sets. PromptDialog's `error` is a string.

### Features

* a confirmation is Base UI's alert dialog ([60fca7b](https://github.com/lutyjj/linen/commit/60fca7b8ec700d3ac2ef02880a39c881cf9a9bdd))
* classes() resolves conflicts on every Tailwind property ([b6ff8c3](https://github.com/lutyjj/linen/commit/b6ff8c380ca658de746833dbfc5219baa79f1d3e))
* conditions are data the app hands Conditions and Shell ([3e4452e](https://github.com/lutyjj/linen/commit/3e4452ec340b7a5d4b38289281cf25a5f01b8e25))
* fields and forms stand on Base UI's Field and Form ([3532620](https://github.com/lutyjj/linen/commit/35326202c57c3781df3006d00d708b31788361b1))
* SelectToggle is Base UI's checkbox, and every export has a use ([8a70898](https://github.com/lutyjj/linen/commit/8a70898aec0094bb4b0dcea0ef2d3d3a44ff6b07))


### Code Refactoring

* a toast's answer is Base UI's toast action ([3a4a511](https://github.com/lutyjj/linen/commit/3a4a5111f47ef5457e90e42283a9f7eee0c64e89))

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
