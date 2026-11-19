# Changelog

## [0.9.0](https://github.com/lutyjj/linen/compare/v0.8.1...v0.9.0) (2026-11-19)


### ⚠ BREAKING CHANGES

* CardHead draws no hairline under itself. A part of a card that is not a band, such as a table or a box that scrolls, draws `border-t border-border` as BAND_CLASS does, and needs no rule taking the line off its first or last row. BAND_CLASS no longer carries the `band` class. A card's first child stands a pixel up under its top edge: one that draws no hairline, such as an image, has its top pixel under the edge, and a hidden first child leaves the next part's line on the edge. A card the app pads holds no head or bands. EmptyState's `className` is its card's; its padding stands in a band inside.
* LinenProvider no longer takes `nonce`. An app that passed one deletes it; nothing linen draws carried it.
* `linen/still` no longer exports `motion`, `animate` or `domAnimation`. An app that resolves `motion` to it and imports them installs Motion and drops the alias; the ones linen uses are unchanged.
* RailRow, railItemClass and useRailCompact are no longer exported. An app that built a row of the rail's foot with them offers it as a RailChoice or in its account menu, or draws its own row. Lines: source +54/-60, specimen +11/-5. consumer/ gzipped: minimal 18956 B JS and 10141 B CSS, unchanged; app 89589 B JS (+18) and 10141 B CSS, inside budget.json.
* a view of a Swap keeps its own first and last margins inside the swap, so a view that starts or ends with a margin stands that much further in; an app that relied on them collapsing out moves the space onto the Swap's className. A DisclosurePanel's className styles a frame around the panel: an app that styled the panel's own box, such as its padding or overflow, styles what the panel holds instead. Lines: source +64/-40, docs +1, budget +2/-2. consumer/ gzipped: minimal 18951 B JS (+2) and 9997 B CSS (+93); app 89857 B JS (+11) and 9997 B CSS (+93). The room's variables, the utilities that read it and the panel's rules take both pages past their 9984 B CSS budget, so budget.json raises it one step to 10048 B.
* a press on a Button marked aria-disabled no longer runs its onClick: the button wears the disabled look, keeps its focus and starts nothing. An app that answered such a press itself, to say why the act is not available, leaves the button live and says so there, or shows the reason beside it.
* CellSelect's inline prop is gone. Drop it: a picker inside a dialog or a popover chooses without closing it.
* NumberField's onValueCommit is onValueCommitted, Base UI's name. A value with a unit, in NumberField, TextField, CellInput or CellText, starts at the frame's inset with its unit after it; a field's className dresses its frame, so text-right there moves nothing. CellInput and TextField take a unit only beside a value the app holds: an uncontrolled field with a unit holds its value in state. CONTROL_CLASS sets a minimum height rather than a height.
* Field, and every field on it (TextField, Select, SearchSelect, NumberField), has no bottom margin, so fields stacked in a plain element touch. Give what stacks them flex flex-col gap-4 or grid gap-4 (CardBody, FormBand and a dialog's body already stack what they hold), and drop the mb-0 and negative margins that undid the old margin. Field's compact prop is gone: a field in a popup takes the name every field does. FieldRow's fields stand 16 px apart instead of 12, and in a column narrower than 28rem one under another, each filling the column. FieldRow takes its width from where it stands: as a flex item, or in a box that fits its contents, give it a width of its own.
* ShownOnce's what is title, and the words it held as children are its description prop.
* CardBody, FormBand and Content lay out each child as one block of a flex column 16 px apart, so an app changes what it stacks there. It drops the gap, grid or margins it gave those children. It puts a run of text and inline elements in one paragraph, which would otherwise break into lines 16 px apart; a lone button or link in Actions, which would otherwise stretch to the band's width; and w-full on a child centred with mx-auto and a max-w-*, which would otherwise shrink to its content. Nothing is a paragraph, so it takes words and links, not blocks. CopyValue grows to fill any flex row it stands in. Every band's padding, an empty state's sides, the gap under a name, the gaps beside words and the measure of a description change as above. A row an app builds in a card can wear BAND_CLASS in place of its own hairline, padding and rule for the head above it.
* a className given to TitleField styles the frame the name stands in, not the input. Its type still reaches the input, which inherits font and colour; a class for the input's own box, such as its border or padding, no longer does.

### Features

* a box that scrolls inside a screen rests its rows at its own edge, clear of the bars ([d895f86](https://github.com/lutyjj/linen/commit/d895f864fc33f07f9c7e943f72966f7b9fce4c7c))
* a fact takes a className ([298e252](https://github.com/lutyjj/linen/commit/298e252c8d216d42f9c2b08c44300cd0ad0ecd68))
* a field's value starts at its inset, its unit a space after it ([4266cd3](https://github.com/lutyjj/linen/commit/4266cd3de5bcb9f53945831e740a2871841b2d4f))
* a picker's list always leaves through a portal ([a5670df](https://github.com/lutyjj/linen/commit/a5670dfe4fac017c8409d6fe9426d9f3af1fa112))
* a secret shown once takes a title and a description ([e2f3f2d](https://github.com/lutyjj/linen/commit/e2f3f2dccad39566b54485bf4348e2302bd35d04))
* a section can be current at its own address alone ([88c418b](https://github.com/lutyjj/linen/commit/88c418b93011156110ed43436f43fff2d93bdae8))
* every band of a card keeps one rhythm ([ca0b596](https://github.com/lutyjj/linen/commit/ca0b59660950b1ff94f06bfb29ca40763363a47f))
* the Foundations page draws the type steps, tints, scrim and check corner it lacked ([2a55add](https://github.com/lutyjj/linen/commit/2a55add83a6b2609b6614606c20f85e3c5a20dec))
* the specimen draws sections, a place's count and unsaved work ([29a8567](https://github.com/lutyjj/linen/commit/29a85674962706eb7c63dd0915888b103c438d89))


### Bug Fixes

* a box that clips keeps the focus ring's room in every browser ([ea149c4](https://github.com/lutyjj/linen/commit/ea149c427086de6460a73fc93d555b71c95b18e5))
* a busy control answers no hover or press ([be6cd95](https://github.com/lutyjj/linen/commit/be6cd9548b0ca9295feca9f58dcd249902c176f0))
* a button's hover and press step toward its words' ink in both themes ([841865a](https://github.com/lutyjj/linen/commit/841865aeefeb845639a1c18dbdd7b6660ce5776b))
* a card draws one hairline between its parts whatever holds them ([e1cfbfd](https://github.com/lutyjj/linen/commit/e1cfbfd245de42713fe717dda27ba44adfebd9dd))
* a checkbox's hairline answers the pointer ([0a5ff17](https://github.com/lutyjj/linen/commit/0a5ff17d9fc47f43e8d294cfe6d9faefbf69b21a))
* a count handed nothing draws nothing ([1c1892e](https://github.com/lutyjj/linen/commit/1c1892ea61a00d68db9f289775ace940959814d4))
* a dialog stands its parts on a band's steps ([53e5f73](https://github.com/lutyjj/linen/commit/53e5f735ac17f193b0d8aec5b4a1c55e9fec8243))
* a disabled control has one look and answers no hover ([ebbe253](https://github.com/lutyjj/linen/commit/ebbe25383766a61cec9a634254ffe9a43f2ae790))
* a field's hint and error keep the reading measure ([3f6c916](https://github.com/lutyjj/linen/commit/3f6c916cd26d1486ea4bf386a6b6304991b74ed5))
* a field's unit follows a value only ([67c49bd](https://github.com/lutyjj/linen/commit/67c49bd45289352213194e35e8ca90a964b1ef09))
* a long wordmark wraps beside the rail's fold ([6097cce](https://github.com/lutyjj/linen/commit/6097cce1e6a6ac4d76b33a2490fba2faf841515d))
* a message widens a field in a row only up to 20rem ([b565a99](https://github.com/lutyjj/linen/commit/b565a99b280bfe921ff8939e841e6f1e99a472e0))
* a number field at either end of its range is not drawn disabled ([63698c1](https://github.com/lutyjj/linen/commit/63698c1eefdf953cef86da65275dd2ab65714cb6))
* a number field keeps its own step with Alt held ([06ca2d3](https://github.com/lutyjj/linen/commit/06ca2d38f7b57c85f57eccd57d5db2b588fce21a))
* a prompt's box takes the focus from the dialog alone ([02700ab](https://github.com/lutyjj/linen/commit/02700ab744587d5e8d1d4c6ff92334448416c2f6))
* a step whose act goes through a dialog keeps the focus ([fc673ad](https://github.com/lutyjj/linen/commit/fc673ade3db38d11e2426f12f5b2f6c2ddf51bc1))
* a suggested option card stands out only until the question is answered ([f5e6eaf](https://github.com/lutyjj/linen/commit/f5e6eafa53923321ef40f4118a51030b2ec379a0))
* a Tab stop in a box that scrolls comes into view the nearest way ([e655d89](https://github.com/lutyjj/linen/commit/e655d89a72f7616a73a97fc73d584e61a580ab62))
* a toast wraps a long message at a glance's measure ([6eede27](https://github.com/lutyjj/linen/commit/6eede279406a7c3d34a21c743a2c0d02463ebba1))
* a toast's answers are buttons ([69b3b5e](https://github.com/lutyjj/linen/commit/69b3b5ead0f00b4a0ec608ffd186e8429f1dbd2a))
* a top bar and an editable title take className where they stand ([487f294](https://github.com/lutyjj/linen/commit/487f29464da1b25c8d5e9e83530aca9683a06609))
* a top bar is as tall with a trail as with a lead ([ca6c4be](https://github.com/lutyjj/linen/commit/ca6c4beb2b80333df47d70d8e18cdda94b30e341))
* an app's stylesheet holds no utility from linen's doc comments ([da91715](https://github.com/lutyjj/linen/commit/da917157dd8a961204a7144232dc26d784bcfe9a))
* an editable title is as narrow as a short name ([70ffeda](https://github.com/lutyjj/linen/commit/70ffedaeb209095c287f4ad6d09834a49937aa88))
* an editable title wears linen's focus ring ([963c2e7](https://github.com/lutyjj/linen/commit/963c2e789620955ed1487b6a2779ee8f16baaa99))
* every card head stands the same, with actions or without ([1da5e33](https://github.com/lutyjj/linen/commit/1da5e337a6d28ec2e56f17652f8f8cc6447e909f))
* every place in navigation wears one look ([2db4ba3](https://github.com/lutyjj/linen/commit/2db4ba38fab6c49c000c87078da963c890ddf301))
* small faults in controls and feedback ([c34b9eb](https://github.com/lutyjj/linen/commit/c34b9eb8bed55a5d7e35519577235c7c6d9ebaca))
* text corrected in place keeps its value through a failed write ([d6081cb](https://github.com/lutyjj/linen/commit/d6081cbc6a1430c66b98bc312aef58297431afb9))
* the conditions band spaces its parts as a notice does ([02fabff](https://github.com/lutyjj/linen/commit/02fabffc6de4092d246ad80c963da7f2d48a0acb))
* the disabled look yields to a caller's class and keeps its words ([110941b](https://github.com/lutyjj/linen/commit/110941b2dc0e90f98605de3f0e0e947d13e8d532))
* the search box in a picker's list shows its focus ([2f002e1](https://github.com/lutyjj/linen/commit/2f002e130aa679abca4b55c076fda24e8b916d52))
* the sections take a className and each shell job is done once ([6338f0d](https://github.com/lutyjj/linen/commit/6338f0db9e82398e1691838adbb9b44933f01294))
* the shell spaces its parts on the 4px scale ([811cefd](https://github.com/lutyjj/linen/commit/811cefde89e5c1a81e611d3ff795fbe4370477b9))
* the specimen pins the saved theme before the first paint ([e07a646](https://github.com/lutyjj/linen/commit/e07a646df2d356f840d8bf72152a475742ce75e6))
* the specimen's screens leave a sticky toast's room at their foot ([dbaccda](https://github.com/lutyjj/linen/commit/dbaccda42f5f82bdff39dbf360be6cc82a8a30f2))
* the top bar spaces its parts on the Layout rule ([9290397](https://github.com/lutyjj/linen/commit/9290397101e45dcf7a93069c71627c7b5bbe2293))
* what reads beside a head's title never makes its row taller ([e261789](https://github.com/lutyjj/linen/commit/e261789e45fb5ab9cf7aaf8c10bfb8c39f1358d0))
* what stacks fields sets the room between them ([8a45fec](https://github.com/lutyjj/linen/commit/8a45fec18e49f53e905b69828a00619a3ce626ea))


### Code Refactoring

* linen/still provides what linen imports from Motion and no more ([3cc2646](https://github.com/lutyjj/linen/commit/3cc26464ec2add555adb3d689346f39e23a3c830))
* LinenProvider takes no nonce, which reached nothing ([3e92661](https://github.com/lutyjj/linen/commit/3e926611e5e120d2ad3c699970528cc59bb28879))

## [0.8.1](https://github.com/lutyjj/linen/compare/v0.8.0...v0.8.1) (2026-11-18)


### Bug Fixes

* a card head's actions take the whole line under its words ([14d1c72](https://github.com/lutyjj/linen/commit/14d1c72bf643b21e762ce66626957bd62abef29b))
* a slot handed nothing draws nothing ([eb00a7a](https://github.com/lutyjj/linen/commit/eb00a7a8c51a089eac14b0a9880abc3cdcb6171e))

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
